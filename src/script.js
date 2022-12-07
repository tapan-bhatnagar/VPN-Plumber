import axios from 'axios';



function notifyMe(flag) {

    let message = ""

    if (flag === "ip") {
        message = "Your IP is leaking!"
    } else {
        message = "Your DNS is leaking!"
    }

    if (!("Notification" in window)) {
        console.log('1');
        // Check if the browser supports notifications
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
        const notification = new Notification(message, {
            icon: 'img.png',
            body: 'Click here to see what to do next! '
        });

        notification.onclick = function () {
            window.open("https://spurious-line-42f.notion.site/Hey-There-8cb82e6dc53948b49a27ebc3f63ccac2");
        }
        // …
    } else if (Notification.permission !== "denied") {
        // We need to ask the user for permission
        console.log('3');
        Notification.requestPermission().then((permission) => {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                const notification = new Notification(message, {
                    icon: 'img.png',
                    body: 'Click here to see what to do next! '
                });
            }
        });
    }

    // At last, if the user has denied notifications, and you
    // want to be respectful there is no need to bother them anymore.
}

async function getIPv6ISP() {
    let epoch = Date.now();

    // console.log(`https://ipv6.browserleaks.com/ip_json?_=${epoch}`)
    return await axios.get(`https://ipv6.scratchypaws.com/${epoch}`, {
        headers: {
            'Accept-Encoding': 'application/json',
        }
    });

}

function makeid() {
    var result           = '';
    var characters       = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < 16; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

async function getAllISP() {

    let successRes = 0;
    const ispSet = new Set()

    for (let i = 0; i < 50; i++) {
        // generate a 16-length alphanumeric string as the prefix
        let urlPrefix = makeid()
        // console.log( urlPrefix)

        // make the request and get the response data
        const response = await axios.get(`https://${urlPrefix}.scratchypaws.com/get`, {
            headers: {
                'origin': 'https://browserleaks.com',
            }
        });

        if (response.data) {
            successRes++;
            let dict = response.data;
            let values = Object.keys(dict).map(function(key){
                return dict[key];
            });
            for(let j = 0; j < values.length; j++){
                ispSet.add(values[j][2])
            }
        }

    }
    console.log(successRes);
    console.log(ispSet)
    return ispSet

}

let intervalVar = null;

export default function main(flag) {
    // run the ipv6 test to get the details of ipv6 and dns
    // check it from the previous data
    // if previous data is not there, save it to global variable
    // if data is changed, check if the ipv6 or dns is leaking
    // send a notification accordingly.

    // running it for the first time
    if (flag === 1) {
        console.log("starting .....")
        // let ipv4 = ""
        let ipv6 = ""
        let isp = ""

        intervalVar = setInterval(async function () {
            // put this in loop
            notifyMe("ip")
            let userDetails = await checkForVPN(ipv6, isp);
            console.log(JSON.stringify(userDetails))
            // ipv4 = userDetails.ipv4;
            ipv6 = userDetails.ipv6;
            isp = userDetails.isp;
        }, 5000);

    } else {
        clearInterval(intervalVar)
    }


}

async function checkForVPN(ipv6, isp) {
    // notifyMe();

    if (isp === "") {
        console.log("running for first time.")
        const apiKey = '5dfa0dfb4b5254ef53aee7b83cf2c92252346c16d47a466cae99eae1';

        // const res = await axios.get(`https://api.ipdata.co?api-key=${apiKey}`);
        // ipv4 = res.data.ip

        let res2 = await getIPv6ISP()

        ipv6 = res2.data.ip;
        isp = res2.data.ISP;

        console.log("updated the data for first time.")
        return {ipv6, isp};
    } else {
        // running it for all other iterations

        let res = await getIPv6ISP()
        let newIpv6 = res.data.ip
        let newISP = res.data.ISP
        console.log("comparing old data with new.");
        console.log(isp + " == " + newISP);
        console.log(ipv6 + " == " + newIpv6);

        // Todo: check for timezones of the user as well
        if (isp === newISP) {
            // no isp change means no VPN started yet
            console.log("VPN is OFF.")
            return {ipv6, isp};
        } else {
            //Todo: send a notification that the VPN has started.
            console.log("VPN is ON.")
            // check for dns leaks
            console.log("checking for dns leak")
            let ispArr = await getAllISP();
            if (ispArr.includes(isp)) {
                console.log("DNS is leaked!");
                notifyMe("dns")
            } else {
                console.log("DNS is not leaked.")
            }
            // now the VPN is ON as the ISP has changed
            console.log("Checking for IP leak.")
            if (ipv6 === newIpv6) {
                // IPv6 is leaking
                console.log("IP is leaking.")
                notifyMe("ip");
            } else {
                console.log("IP is not leaking.")
                isp = newISP;
                ipv6 = newIpv6;
            }
        }

        return {ipv6, isp};
    }

}


