const xml = `<?xml version="1.0" standalone="yes" ?>

<!-- Comment in document body -->

<?xml-stylesheet type="text/css" href="style.css"?>


<!DOCTYPE form [
    <!-- Comment in DTD -->
    <!ELEMENT form (group*|script?) >
    ]>

<form xmlns="https://www.swchen.com/schema/form"
      xmlns:extern="https://www.swchen.com/schema/form/extern"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="https://www.swchen.com/schema/form form.xsd">

    <!-- Comment in element form -->

    <group margin="10"
           padding="5"
           border="1">
        <!-- Comment in element section -->
        user:
        <input/>
        password:
        <input type="password"/>
        file:
        <input type="file"/>
    </group>

    <extern:group extern:margin="10"
                  padding="5"
                  border="1">
        <!-- Comment in element section -->
        user:
        <extern:input/>
        password:
        <extern:input type="password"/>
        file:
        <extern:input type="file"/>
    </extern:group>

    <script>
        <![CDATA[

        function foo() {
            console.log("Hello World!");
        }
]]>
    </script>
</form>
`;


export default xml;
