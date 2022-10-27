const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const client = require("mailchimp-marketing");
const md5 = require("md5");
const app = express();

const apiKey = process.env.api_key;
const listId = process.env.list_id;
const server = process.env.server;

client.setConfig({
    apiKey: apiKey,
    server: server
});

const addMember = async (fname, lname, email) => {
   

    const response = await client.lists.addListMember(listId, {
        email_address: email,
        status: "subscribed",
        merge_fields: {
            "FNAME": fname,
            "LNAME": lname,
        }
    });
    console.log(response);

    

};

const checkStatus = async (email) => {
    const subscriberHash = md5(email.toLowerCase());
    try {
        const response = await client.lists.getListMember(
            listId,
            subscriberHash
        );

        console.log(`This user's subscription status is ${response.status}.`);
            
        
    } catch (e) {
        if (e.status === 404) {
            console.log("user not found");
        }
        
    }
    
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"))

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/web/signup.html");
})

app.post("/", (req, res) => {
    var name = req.body.userName;
    var surname = req.body.userSurname;
    var email = req.body.userEmail;

    const response = addMember(name, surname, email);
    response.then((value)=>{
        res.sendFile(__dirname+ "/public/web/success.html");
    }, (error)=>{
        res.sendFile(__dirname + "/public/web/failure.html");
    })
    // checkStatus(email) ? res.send("Success"):res.send(Fail);
})

app.listen(process.env.PORT || 3000, () => {
    console.log("server running on port 3000");
})
