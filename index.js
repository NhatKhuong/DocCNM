const e = require("express");
const express = require("express");
const app = express();
const port = 3000;
const multer = require("multer");
const upload = multer();

app.use(express.static("./views"));
app.set("view engine", "ejs");
app.set("views", "./views");

const AWS = require("aws-sdk");
const config = new AWS.Config({
    accessKeyId: "AKIAZX26GFMPBHM4YKWB",
    secretAccessKey: "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",
    region: "ap-southeast-1",
});

AWS.config = config;
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "dbSinhVien";

app.get("/", (req, res) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            res.send("Inrenal server error");
        } else {
            return res.render("index", { listItem: data.Items });
        }
    });
});

app.get("/showEdit/:id", (req, res) => {
    const params = {
        TableName: tableName,
        Key: {
            "id": req.params.id
        }
    };

    docClient.get(params, (err, data) => {
        if (err) {
            res.send("Inrenal server error");
        } else {
            return res.render("indexUpdate", { item: data.Item });
        }
    });
});

app.post("/", upload.fields([]), (req, res) => {
    const { ma, ten, ngaysinh, lop } = req.body;
    const params = {
        TableName: tableName,
        Item: {
            id: new Date().getTime() + "",
            ma: ma,
            ten: ten,
            ngaysinh: ngaysinh,
            lop: lop,
        },
    };

    docClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
            res.send("Inrenal server error");
        } else {
            return res.redirect("/");
        }
    });
});

app.post("/update", upload.fields([]), (req, res) => {
    const { id, ma, ten, ngaysinh, lop } = req.body;
    const params = {
        TableName: tableName,
        Item: {
            id: id,
            ma: ma,
            ten: ten,
            ngaysinh: ngaysinh,
            lop: lop,
        },
    };

    docClient.put(params, (err, data) => {
        if (err) {
            console.log(err);
            res.send("Inrenal server error");
        } else {
            return res.redirect("/");
        }
    });
});

app.post('/delete', upload.fields([]), (req, res) => {
    const listItems = Object.keys(req.body);
    if (listItems == 0) {
        return res.redirect("/");
    }

    function onDeleteItem(index) {
        const params = {
            TableName: tableName,
            Key: {
                "id": listItems[index]
            }
        }
        docClient.delete(params, (err, data) => {
            if (err) {
                console.log(err);
                res.send("Inrenal server error");
            } else {
                if (index > 0) {

                    onDeleteItem(index - 1);
                } else {
                    return res.redirect("/");
                }
            }
        })
    }

    onDeleteItem(listItems.length - 1);

})

app.listen(port, () => {
    console.log("build succsess");
});