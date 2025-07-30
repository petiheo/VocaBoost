import {Header, SideBar, Footer} from '../../components';
import DropdownMenu from '../../components/DropdownMenu';

const HomePage = () => {
  return (
    <div className="homepage__wrapper">
      <Header />

      <div className="homepage__body">
        <SideBar />
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
