#! /usr/bin/node

const https = require("https");
const { exit } = require("process");
const readInterface = require("readline").createInterface({ input: process.stdin, output: process.stdout });

console.log("Fetching words...");

https.get("https://pastebin.com/raw/bNEHfL13", res => {
    var raw = "";
    res.resume();

    res.on("readable", () => {
        var chunk = "";
        while((chunk = res.read()) !== null)
            raw += chunk.toString().replace(/\r/g, "\n");
    });
    
    res.on("end", () => {
        const words = raw.split("\n");
        var correctWord;

        while(!(correctWord = words[Math.floor(Math.random() * words.length)]));

        const wordle = [];

        const WordleResult = {
            INCORRECT: "\x1b[37m",
            CORRECT_WRONG_PLACE: "\x1b[33m",
            CORRECT: "\x1b[32m"
        };
        Object.freeze(WordleResult);

        /**
         * @param {(result: string) => void} callback
         */
        const readcon = callback => readInterface.question("", callback);

        var won = false;

        function update() {
            if(won) {
                console.log(WordleResult.CORRECT, "You found the word!");
                return;
            }

            readcon(word => {
                word = word.substring(0, 5);

                console.clear();

                if(!words.includes(word))
                    console.log(word + " was either not recognized as a word, or it's too short (less than 5 characters long)");
                else
                    wordle.push(word.split(""));
                
                console.log(
                    wordle.map(el => {
                        var correct = correctWord.split("");
                        
                        return Object.entries(el).map(([index, el]) => {
                            for(var i = 0; i < correct.length; i++) {
                                if(el === correct[i]) {
                                    correct[i] = "  ";

                                    if(index == i)
                                        return WordleResult.CORRECT + el;
                                    else
                                        return WordleResult.CORRECT_WRONG_PLACE + el;
                                }
                            }

                            return WordleResult.INCORRECT + el;
                        }).join("");
                    }).join("\n")
                );

                if(word === correctWord) {
                    console.log(WordleResult.CORRECT + "You've won the game!");
                    exit();
                }

                console.log("\x1b[37m");
                
                if(wordle.length < 6)
                    update();
                else {
                    console.log("The word was " + WordleResult.CORRECT + correctWord);
                    exit();
                }
            });
        }

        console.clear();

        update();
    });
}).on("error", console.error);
