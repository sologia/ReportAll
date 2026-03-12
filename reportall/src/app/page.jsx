import ButtonGroup from './components/ButtonGroup ';
import MyMap from './components/MyMap';

export default function HomePage() {
  return (
    <>
      <ButtonGroup
        containerClass="flex items-center justify-center mt-12 gap-12"
        buttonClass="w-80 m-auto mt-3"
        buttons={[
          { label: "Enacal", href: "/dashboard/enacal" },
          { label: "Clientes", href: "/dashboard/clientes" },
        ]}
      />

      {/* <MyMap autoSelectCurrentLocation /> */}
    </>
  );
}
