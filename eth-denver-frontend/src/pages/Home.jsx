import { Tab } from "@headlessui/react";
import Create from "../components/Create";
import Play from "../components/Play";
import Navbar from "../components/Navbar";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center">
      <Navbar />

      <Tab.Group>
        <Tab.List>
          <Tab className="w-96 bg-prime-purple py-6 font-bold text-lg border-b-4 border-r-2 border-white">
            Create
          </Tab>
          <Tab className="w-96 bg-prime-purple py-6 font-bold text-lg border-b-4 border-l-2 border-white">
            Play
          </Tab>
        </Tab.List>
        <Tab.Panels>
          <Tab.Panel>
            <Create />
          </Tab.Panel>
          <Tab.Panel>
            <Play />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default Home;
