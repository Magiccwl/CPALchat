

import ChatbotLayout from "./layouts/chatbotLayout";

const Layouts = {
  chatbot: ChatbotLayout,
}

export default function withLayout(Component, type) {
  const Layout = Layouts[type]

  return function (props) {
    return (
      <Layout>
        <Component {...props}/>
      </Layout>
    )
  };
}
