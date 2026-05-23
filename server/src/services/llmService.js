import OpenAI from 'openai';

let cachedClient = null;

function getClient() {
  if (cachedClient) return cachedClient;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('OPENAI_API_KEY가 설정되지 않았습니다. server/.env를 확인하세요.');
    err.status = 500;
    err.code = 'missing_openai_key';
    throw err;
  }
  cachedClient = new OpenAI({ apiKey: key });
  return cachedClient;
}

const TONE_GUIDE = {
  retrospective: '개인 회고 톤. 1인칭("내가/나는"), 학습한 점·고민·다음 액션 중심.',
  review: '코드 리뷰 톤. 변경의 의도, 트레이드오프, 주의할 점을 짚어내는 3인칭 서술.',
  tutorial: '튜토리얼 톤. 따라하기 쉽게 단계별 설명, 예시 코드 강조.',
};

function buildPrompt({ repoFullName, branch, commits, tone }) {
  const toneText = TONE_GUIDE[tone] ?? TONE_GUIDE.retrospective;
  const commitBlocks = commits
    .map((c) => {
      const filesSummary = (c.files ?? [])
        .slice(0, 5)
        .map((f) => `  - ${f.filename} (+${f.additions} / -${f.deletions})`)
        .join('\n');
      const patchSnippet = (c.files ?? [])
        .map((f) => f.patch)
        .filter(Boolean)
        .join('\n')
        .slice(0, 2000);
      return [
        `## commit ${c.sha.slice(0, 7)}: ${(c.message ?? '').split('\n')[0]}`,
        `author: ${c.author?.name ?? 'unknown'}`,
        filesSummary ? `changed files:\n${filesSummary}` : '',
        patchSnippet ? `\npatch preview:\n\`\`\`diff\n${patchSnippet}\n\`\`\`` : '',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n\n');

  const userContent = `repository: ${repoFullName}\nbranch: ${branch}\n\n${commitBlocks}`;

  return {
    system: [
      '너는 개발자 블로그 초안 작성을 돕는 어시스턴트다.',
      '아래 commit 목록과 변경 내용을 바탕으로, 한국어 마크다운 블로그 초안을 작성해라.',
      `톤: ${toneText}`,
      '',
      '출력은 반드시 JSON으로 다음 키만 포함:',
      '{ "title": string, "body": string }',
      'body는 마크다운(헤더/리스트/코드블록 사용 가능). 제목은 70자 이내.',
    ].join('\n'),
    user: userContent,
  };
}

export async function summarizeCommits({ repoFullName, branch, commits, tone }) {
  const client = getClient();
  const { system, user } = buildPrompt({ repoFullName, branch, commits, tone });

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.7,
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    const err = new Error('LLM 응답을 JSON으로 파싱할 수 없습니다.');
    err.status = 502;
    err.code = 'llm_invalid_json';
    err.raw = raw;
    throw err;
  }

  return {
    title: parsed.title ?? '제목 없음',
    body: parsed.body ?? '',
  };
}
