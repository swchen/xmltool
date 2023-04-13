import {Parser} from "xmltool";

const xml = `
<form xmlns="https://www.swchen.com/schema/form"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="https://www.swchen.com/schema/form form.xsd">

    <section margin="10"
             padding="5">
        user: <input/>
        password: <input type="password"/>
        file: <input type="file"/>
    </section>
</form>
`;

const doc = new Parser(xml).parse();
