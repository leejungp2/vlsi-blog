import { useState } from 'react';
import Header from './components/Header.jsx';
import MyBlogPage from './pages/MyBlogPage.jsx';
import SavedPostsPage from './pages/SavedPostsPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import './App.css';

const PAGES = {
  'my-blog': MyBlogPage,
  'saved-posts': SavedPostsPage,
  settings: SettingsPage,
};

function App() {
  const [page, setPage] = useState('my-blog');
  const PageComponent = PAGES[page] ?? MyBlogPage;

  return (
    <main className="app">
      <Header current={page} onChange={setPage} />
      <PageComponent />
    </main>
  );
}

export default App;
