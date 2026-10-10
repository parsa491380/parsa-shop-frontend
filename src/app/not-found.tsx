import Error from "@/components/Error";

import RootLayout from "./(site)/layout";

const notFound = () => {
  return (
    <RootLayout>
      <Error />
    </RootLayout>
  );
};

export default notFound;
