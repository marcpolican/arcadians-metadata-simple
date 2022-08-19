
// Connect to metamask and get the wallet address
async function initEthereum() {
    const provider = new ethers.providers.Web3Provider( window.ethereum, "any");
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();

    let wallet = await signer.getAddress();
    document.getElementById("wallet").innerText =
        "Your wallet is " + wallet;
}

const partsUrl = "https://nftstorage.link/ipfs/bafybeib2ir3zpgd3cmizcv7shekjeftcwq7apjib6i5gz2sjc4vajwtgiy"
var gender = "female";
var parts = {};
var requestCount = 0;

// Query Arcadian metadata with a certain token id
async function queryArcadian() {

    // some error checking
    var input = document.getElementById("tokenId");
    if (input == null || input.value == "") return;

    // this is the same url that you get from querying token uri from the contract
    var url = "https://api.arcadians.io/" + input.value;

    // create a GET request
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
        if (xhr.readyState === xhr.DONE) {
            if (xhr.status === 200) {

                parts = {};
                gender = "female";
                requestCount = 0;

                var data = JSON.parse(xhr.response);

                // Show the Arcadian image
                var img = document.getElementById("arcImage");
                img.src = data.image;

                // Show the metadata json
                var metadata = document.getElementById("arcMetadata").innerText = 
                    JSON.stringify(data, null, 2);

                for (let trait of data.attributes) {
                    // partName
                    var pn = trait.trait_type.toLowerCase().replaceAll(" ", "-");

                    // partValue
                    var pv = trait.value.toLowerCase().replaceAll(" ", "-");

                    // skip these things
                    if (pv == "none") continue;
                    if (pn == "background" || pn == "pet") continue;

                    if (pn == "class") {
                        if (pv.indexOf("female") < 0)
                            gender = "male";
                        continue;
                    }

                    requestCount++;
                    var img = new Image();
                    img.src = `${partsUrl}/${gender}/${pn}/${pv}.png`;
                    img.addEventListener('load', () => {
                        requestCount--;
                    }, false);

                    parts[pn] = img;
                    setTimeout(waitForParts, 500);
                }
            }
        }
    };
    xhr.open("GET", url);
    xhr.send();
}

function waitForParts() {
    if (requestCount > 0)
        setTimeout(waitForParts, 500);
    else
        drawOnCanvas();
}

async function drawOnCanvas() {
    canvas = document.getElementById('canvas');

    if (canvas == null && canvas.getContext == null) {
        console.log("canvas not supported");
        return;
    }

    ctx = canvas.getContext('2d');

    ctx.fillStyle = `rgb(140, 130, 130)`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.mozImageSmoothingEnabled = false;
    ctx.webkitImageSmoothingEnabled = false;
    ctx.msImageSmoothingEnabled = false;
    ctx.imageSmoothingEnabled = false;

    var drawOrder = ["skin", "top", "bottom", "eyes", "mouth", "head", "left-hand", "right-hand"];

    var scale = 3;
    for (let d of drawOrder) {
        var p = parts[d];
        if (p != null) ctx.drawImage(p,0,0);
    }

    var scale = 3;
    for (let d of drawOrder) {
        var p = parts[d];
        if (p != null) ctx.drawImage(p,0,0,p.width*scale,p.height*scale);
    }
}

