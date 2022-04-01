const mysql = require("mysql");



db = mysql.createConnection({
    host: "us-cdbr-east-05.cleardb.net",
    user: "b40ab652e7a91e",
    password: "f168b1d7",
    database: "heroku_4cef9eefc05a293"
});
db.connect((err) => {
    if (err) {
        console.log("Error connecting to DB: ");
        console.log(err);
        return;
    }

    console.log("Connection to DB established!");
    setInterval(function () {
        db.query("SELECT 1");
    }, 5000);

});

function makePost(sql, callback=null) {
    db.query(sql, function(err, result) {
        if (err) throw err;

        var parsedResult = JSON.parse(JSON.stringify(result));
        if (callback) {
            return callback(parsedResult);
        }
    });
}

let info = {
    "id": "hu9sTTHIbv",
    "title": "ree challenge",
    "instructions": "### In this challenge you will ree\n\n-----\n\n### Description:\nYou need to code the function: `ree(n)` that takes in the integer value `n` and returns a list with `n` strings of `\"ree\"`\n\n\n-----\n\n\n### Examples:\n```\nree(1) > [\"ree\"]\nree(2) > [\"ree\", \"ree\"]\nree(0) > []\n```",
    "exampleTests": "import cr_test\nfrom solution import ree\n\nclass ReeTests(cr_test.TestGroup):\n    def normal_tests(self):\n        self.assert_equal(self, ree(1), [\"ree\"])\n        self.assert_equal(self, ree(2), [\"ree\", \"ree\"])\n    \n    def trick_tests(self):\n        self.assert_equal(self, ree(0), [])\n        self.assert_equal(self, ree(-1), [])\n\n\n",
    "submissionTests": "import random\nfrom solution import ree\nimport cr_test\n\ndef actual_solution(n):\n    result = []\n    for x in range(n):\n        result.append(\"ree\")\n    return result\n\nrandomPositive = []\nrandomNegative = []\n\nfor x in range(20):\n    randomPositive.append(random.randint(0, 100))\n\nfor x in range(5):\n    randomNegative.append(random.randint(-10, 0))\n\n\nclass ReeSubmissionTests(cr_test.TestGroup):\n    def test_random_positive(self):\n        for randomInput in randomPositive:\n            self.assert_equal(self, \n                                ree(randomInput), \n                                actual_solution(randomInput)\n                            )\n\n    def test_random_negative(self):\n        for randomInput in randomNegative:\n            self.assert_equal(self, \n                                ree(randomInput), \n                                actual_solution(randomInput)\n                            )\n    \n    def test_zero(self):\n        self.assert_equal(self, \n                            ree(0), \n                            actual_solution(0)\n                        )\n\n\n",
    "initialSolution": "\ndef ree(n):\n    # Write your code here\n    return n\n\n"
}

// makePost("DROP TABLE challenges", (r) => {
//     console.log("Dropped");
// })

// makePost("CREATE TABLE challenges (id CHAR(10), title TINYTEXT, instructions MEDIUMTEXT, exampleTests MEDIUMTEXT, submissionTests MEDIUMTEXT, initialSolution MEDIUMTEXT) CHARSET=utf8 COLLATE utf8_bin", (result) => {
//     console.log("Created challneges");
// });

// makePost(`INSERT INTO challenges (id, title, instructions, exampleTests, submissionTests, initialSolution) VALUES ('${info.id}', '${info.title}', '${info.instructions}', '${info.exampleTests}', '${info.submissionTests}', '${info.initialSolution}')`, (result) => {
//     console.log("Succes creating challenge!")

// });

// makePost("SELECT * FROM challenges WHERE id='aklklklkak'", (r) => {
//     console.log(r);
// });