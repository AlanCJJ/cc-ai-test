const readline = require('readline');
const getInput = async text => {
  return new Promise((res, rej) => {
    const interface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    interface.question(`${text}\n`, input => {
      interface.close();
      res(input);
    });
  });
};

module.exports = {
  getInput
};
