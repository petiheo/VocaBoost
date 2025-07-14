import { Outlet } from "react-router-dom";
import { Header, SideBar, Footer } from "../../../components";

export default function ClassroomLayout() {
  return (
    <div className="learners-layout">
      <Header />
      <div className="learners-layout__body">
        <div className="learners-layout__sidebar">
          <SideBar />
        </div>
        <div className="learners-layout__content">
          <Outlet /> {/* Hiển thị các route con */}
        </div>
      </div>
      <Footer />
    </div>
  );
}