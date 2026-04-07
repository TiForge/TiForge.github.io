
let statusBarImg;
let statusBarTxtName;
let statusBarTxtType;
let statusBarTxtExtra;

function loadBars() {
    fetch("Resources/GlobalContent/sidebar.html").then(res => res.text()).then(data => {
        document.getElementById("Sidebar").innerHTML = data;
        
        let links = document.getElementById("Sidebar").querySelectorAll("a");
        const currentPage = window.location.pathname.split("/").pop();

        links.forEach(link => {
            const sidebarButton = link.querySelector("button");

            if (link.getAttribute("href") === currentPage && sidebarButton.classList.contains("SidebarButton")) {
                sidebarButton.id = "SidebarButtonActive";
            }
        });
    });
    

    fetch("Resources/GlobalContent/topbar.html").then(res => res.text()).then(data => {
        document.getElementById("Topbar").innerHTML = data;
    });

    fetch("Resources/GlobalContent/statusbar.html").then(res => res.text()).then(data => {
        document.getElementById("Statusbar").innerHTML = data;
        
        statusBarImg = document.querySelector(".StatusbarImg");
        statusBarTxtName = document.querySelector(".StatusbarObjectInfoName");
        statusBarTxtType = document.querySelector(".StatusbarObjectInfoType");
        statusBarTxtExtra = document.querySelector(".StatusbarObjectInfoExtra");
        
        document.dispatchEvent(new Event("StatusLoaded"));
    });
    
}

loadBars();

document.addEventListener("StatusLoaded", () => {
    updateStatusBarInfo();
});

// Statusbar

async function updateStatusBarInfo(ImgPath = "", Name = "", Type = "", Extra = "") {
    statusBarImg.src = ImgPath;
    statusBarTxtName.innerText = Name;
    statusBarTxtType.innerText = Type;
    statusBarTxtExtra.innerText = Extra;
}; 

document.addEventListener("mouseover", (e) => {
    const el = e.target.closest("[data-status-img]");

    if (el) {
        updateStatusBarInfo(
            el.dataset.statusImg,
            el.dataset.statusName,
            el.dataset.statusType,
            el.dataset.statusExtra
        )
    }
});

document.addEventListener("mouseout", (e) => {
    const el = e.target.closest("[data-status-img]");

    if (el) {
        updateStatusBarInfo()
    }
});

// Home animation
const HomeAniIcons = [
    "Resources/HighRes/Software/Briefcase.png",
    "Resources/Win7Flag.png",
    "Resources/HighRes/Games.png",
    "Resources/Shoutouts/Godot.png"
];

const HomeAniRows = document.querySelectorAll(".AnimationRow");

function getNeededHomeAniData() {
    if (HomeAniRows.length > 0) {
        return [HomeAniRows[0].offsetHeight, HomeAniRows[0].offsetWidth - 200];
    } else {
        return [null, null];
    }
}

let HomeIconWidth = getNeededHomeAniData()[0];
// 200 is the width of the sidebar in pixels, and is fixed
let HomeRowWidth = getNeededHomeAniData()[1];
let ActiveHomeIcons = [];

function calcIconCount() { // gets the best number of icons for the width of the rows
    let count = 0;

    while (count * HomeIconWidth < HomeRowWidth) {
        count += 1
    }
    
    return count - 1; // subtract one to make icons less tightly packed
}

function calcSpacing() { // Calculates the best spacing between icons
    //Subtracting 1 from the icon count here leads to one icon being offscreen, making warping seamless
    return (HomeRowWidth - (HomeIconWidth * (IconsPerRow - 1))) / (IconsPerRow - 1);
}

let IconsPerRow = calcIconCount();
let IconSpacing = calcSpacing();

function initHomeAni() {
    HomeAniRows.forEach((row, index) => {
        let direction = index % 2 == 0 ? "left" : "right";
        for (let i = 0; i < IconsPerRow; i++) {
            spawnIcon(row, direction, (HomeIconWidth + IconSpacing) * i, index, i);
        }
    });
}

function spawnIcon(row, direction, startX, index, arrayPos) {
    const iconDiv = document.createElement("div");
    iconDiv.classList.add("AnimationBox");

    const iconImg = document.createElement("img");
    iconDiv.classList.add("AnimationBoxIcon");

    let imageIndex = Math.floor(Math.random() * HomeAniIcons.length);

    iconImg.src = HomeAniIcons[imageIndex];
    iconDiv.id = imageIndex;

    iconDiv.appendChild(iconImg);
    row.appendChild(iconDiv);

    let x = startX ?? (direction === "left" ? 0 : HomeRowWidth);

    iconDiv.style.transform = `translateX(${x}px)`;

    ActiveHomeIcons.push({
        el: iconDiv,
        row: row,
        dir: direction,
        x: x,
        speedMul: index * 0.3
    })
}

const HomeAniSpeed = 1.0;

function animateHomeIcons() {
    ActiveHomeIcons.forEach(icon => {

        if (icon.dir === "left") {
            icon.x -= HomeAniSpeed + icon.speedMul;
        } else {
            icon.x += HomeAniSpeed + icon.speedMul;
        }

        const totalWidth = IconsPerRow * (HomeIconWidth + IconSpacing);

        if (icon.dir === "left" && icon.x < -HomeIconWidth) {
            icon.x += totalWidth;
            updateIconImg(icon.el);
        }

        if (icon.dir === "right" && icon.x > HomeRowWidth) {
            icon.x -= totalWidth;
            updateIconImg(icon.el);
        }

        icon.el.style.transform = `translateX(${icon.x}px)`;
    });

    requestAnimationFrame(animateHomeIcons);
}

function updateIconImg(el) {

    let curImage = Number(el.id);
    let newImage = Math.floor(Math.random() * HomeAniIcons.length);

    while (newImage === curImage) { // Don't allow the same image to be chosen
        newImage = Math.floor(Math.random() * HomeAniIcons.length);
    }

    el.querySelector("img").src = HomeAniIcons[newImage];
    el.id = newImage;
}

function resetHomeAni() {
    ActiveHomeIcons.forEach(icon => {
        icon.row.removeChild(icon.el);
    });

    ActiveHomeIcons = [];

    HomeRowWidth = HomeAniRows[0].offsetWidth;

    const newCount = calcIconCount();
    IconsPerRow = newCount;

    initHomeAni();
    animateHomeIcons();
}

let resizeTimeout;

window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);

    resizeTimeout = setTimeout(() => {
        resetHomeAni();
    }, 150);
});

if (HomeAniRows.length !== 0) {
    initHomeAni();
    animateHomeIcons();
}
