let request = require("request"),
    cheerio = require("cheerio");

let tables = [], htmlPage;
let url = "https://www.knteu.kiev.ua/blog/read/?pid=1038&uk";

getPage(url).then(result => {
    let $ = cheerio.load(result);
    $("table").each((i, elem) => {
        tables[i] = $(elem);
    });
    htmlPage = result;
}, err => {
    console.log(err);
});

exports.getBellSchedule = (resolve, reject) => {
    
    let $ = cheerio.load(htmlPage);
  //  console.log(tables[0]);
  //  let answer = `https://www.knteu.kiev.ua${$(tables[0]).find($("a")).attr("href")}`;
   // let answer = `https://www.knteu.kiev.ua${$("a").attr("href")}`;
     $("table").each((i, elem) => {
        tables[i] = $(elem);
    });
  //  console.log($(tables[0]).find($("a")).attr("href"));
    let answer = `https://www.knteu.kiev.ua`+ $(tables[0]).find($("a")).attr("href");
    resolve(answer);

}

// Bachelor schedule
exports.getSchedule = (course, faculty, resolve, reject) => {
    let $ = cheerio.load(htmlPage);
    
    $("table").each((i, elem) => {
        tables[i] = $(elem);
    });
    let table = $(tables[1]),
        fields = [];
    $(table).find("tr").each((i, elem) => {
        fields[i] = $(elem);
    });
    $(fields[course]).find("td").each((i, elem) => {
        fields[course][i] = $(elem);
    });
    
    //to fetch faculty
    $(fields[0]).find("td").each((i, elem) => {
       fields[0][i] = $(elem); 
    });
    //
    
  //  let answer = $(table[course][group-1]).find("a").attr("href"); 
   // console.log(`${$(fields[course][faculty]).find("strong").text()} , факультет: ${$(fields[0][faculty]).find("strong").text()}`);
   // console.log($(fields[course][faculty]).find("a").attr("href"));
    let link = `https://www.knteu.kiev.ua` + $(fields[course][faculty]).find("a").attr("href");
    resolve([$(fields[0][faculty]).find("strong").text(), link]);
}

// Magister schedule
exports.getMSchedule = (course, faculty, resolve, reject) => {
    
    let $ = cheerio.load(htmlPage);
    course -= 4; // 5 course => 5-4 = 1 course, the same with "6"

    $("table").each((i, elem) => {
        tables[i] = $(elem);
    });
    let table = $(tables[2]),
        fields = [];

    $(table).find("tr").each((i, elem) => {
        fields[i] = $(elem);
    });
    $(fields[course]).find("td").each((i, elem) => {
        fields[course][i] = $(elem);
    });

    //to fetch faculty
    $(fields[0]).find("td").each((i, elem) => {
       fields[0][i] = $(elem); 
    });
    //
    let link = `https://www.knteu.kiev.ua` + $(fields[course][faculty]).find("a").attr("href");
    resolve([$(fields[0][faculty]).find("strong").text(), link]);
}

function getPage(url) {
    return new Promise((resol, rej) => {
        request(url, (err, res, body) => {
            if (err) rej(err);
            resol(res.body);
        });
    });
}