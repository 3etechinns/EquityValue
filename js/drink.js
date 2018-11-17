//global variables
var sym = '';
var symSel = $("#sym");

// Go button click
$("#gotick").on("click", function () {
    if (sym !== symSel.val()) { // check if new stock ticker is selected
        sym = symSel.val();
        if (sym === "") {
            $("input").attr("placeholder", "Enter Stock Ticker");
        } else {

            // set price block
            setPriceBlock();

            // set company name
            getMorningStarDetails();
        }
    } else if (sym === "") {
        $("input").attr("placeholder", "Enter Stock Ticker");
    }
});

// Search enter key --> simulate button press
symSel.keyup(function (event) {
    if (event.keyCode === 13) {
        $("#gotick").click();
    }
});

// Error Handlers
function logError(e) {
    $("#ival").html("$-x-");
    $("#currentyield").html("-x- %");
    $("#safetyfac").html(" -x- ");
    $("#buyval").html("$ -x-");
    $("#iyield").html(" -x- %");
    $("#bookpct").html(" -- %");
    $("#roe").html(" -- %");
    $("#gmar").html(" -- %");
    $("#debtEq").html(" -- ");
    if (e === undefined) {
        $("#status").html("Cannot find intrinsic value for negative EPS");
    } else {
        $("#status").html(e.message);
        console.log(e.message);
    }
}

// Morningstar Data
function getMorningStarDetails() {
    var msurl =
        "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Ffinancials.morningstar.com%2Fajax%2FexportKR2CSV.html%3Ft%3D" +
        sym +
        "'&format=json&callback=";
    try {
        $.getJSON(msurl, function (mjson) {
            //$.getJSON("./json/tempms.json", function (mjson) {
            //company name
            $("#company").find("h2").html(mjson.query.results.row[0].col0.substring(47, 200));

            // set intrinsic value data
            setIntrinsicValue(mjson);
        });
    } catch (e) {
        logError(e);
    }
}

function setIntrinsicValue(mjson) {
    var eps = parseFloat(mjson.query.results.row[8].col11);
    if (eps > 0) {
        $("#status").html("");
        var bookval = parseFloat(mjson.query.results.row[12].col11);
        var b10 = parseFloat(mjson.query.results.row[12].col10);
        var i = 1;
        while (!(mjson.query.results.row[12]["col" + i])) {
            i++;
        }
        var bi = parseFloat(mjson.query.results.row[12]["col" + i]);
        if (b10 - bi > 0) {
            var growth = 69 * (Math.pow(b10 / bi, 1 / (9 - i)) - 1); //conservative growth 69% --> e^1
            var ival = Math.floor(eps * (growth + 7) * 440 / 3.67) / 100;
            var price = $("#price").html();

            // set intrinsic price
            $("#ival").html("$" + ival);
            $("#iyield").html(Math.floor(growth * 100) / 100 + "%");

            // set buy price
            var fos = 1.25; // 75% factor of safety --> trust in calculation
            var buyval = Math.floor(ival * 100 / fos) / 100;
            var buyvalSel = $("#buyval");
            buyvalSel.html("$" + buyval);
            if (price <= buyval) {
                buyvalSel.css('color', "green");
            } else {
                buyvalSel.css('color', "red");
            }
            // set current yield
            var cval = Math.floor((Math.pow(ival * Math.pow((1 + growth / 100), 5) / price, 1 / 5) - 1) * 10000) / 100;
            $("#currentyield").html(cval + "%");

            // set safety-risk
            //debt-eq
            var debtEq = mjson.query.results.row[99].col10;
            if (debtEq === null) {
                debtEq = 1;
            }
            $("#debtEq").html(debtEq);
            debtEq = 0.9 / debtEq; // 0.9 --> 90% max debt ratio

            // ROE
            var roe = mjson.query.results.row[37].col10;
            if (roe === null) {
                roe = 100 * eps / bookval;
            }
            $("#roe").html(Math.floor(roe * 100) / 100 + " %");
            roe = roe / 20; // 0.2 --> 20% min roe

            // Gross Margin
            var gmar = mjson.query.results.row[4].col10;
            $("#gmar").html(gmar + " %");
            gmar = gmar / 60; // 60 --> 60% min gross margin

            //Book Price
            $("#bookpct").html(Math.floor(10000 * bookval / price) / 100 + " %");

            // Safety --> 1/Risk
            var bookpct = Math.floor(bookval * debtEq * roe * 10000 / price) / 100;
            $("#safetyfac").html(bookpct + " %");

        } else {
            logError();
        }
    } else {
        logError();
    }
}

function setPriceBlock() {
    var alphaurl =
        "https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=" + sym + "&interval=60min&outputsize=compact&apikey=RYJDPZ0S2IX0HAYM";
    try {
        $.getJSON(alphaurl, function (ajson) {
            //$.getJSON("./json/tempalpha.json", function (ajson) {
            var datetimelast = ajson["Meta Data"]["3. Last Refreshed"];
            var price = Math.floor(ajson["Time Series (60min)"][datetimelast]["1. open"] * 100) / 100;
            $("#price").html(price);
        });
    } catch (e) {
        logError(e);
    }
}