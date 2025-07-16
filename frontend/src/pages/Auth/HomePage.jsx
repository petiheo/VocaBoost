import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Sidebar from '../../components/SideBar';
import DropdownMenu from '../../components/DropdownMenu';

const HomePage = () => {
  return (
    <div className="homepage__wrapper">
      <Header />

      <div className="homepage__body">
        <Sidebar />
        
        <main className="homepage__main">
          <section className="homepage__content">
            <h1>Welcome to VocaBoost</h1>
            <p>Here you can manage your vocabulary lists, view reports, and more.</p>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
