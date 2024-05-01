let audio = new Audio();
let curfol = "";
let array = [];
let vdo = document.querySelector("#vdo");

function secToMin(seconds) {
  let min = Math.floor(seconds / 60);
  let sec = Math.floor(seconds % 60);

  let fmin = String(min).padStart(2, "0");
  let fsec = String(sec).padStart(2, "0");

  return `${fmin}:${fsec}`;
}

async function getPlaylists() {
  let a = await fetch("http://127.0.0.1:3000/js/Songs/");
  let b = await a.text();
  let div = document.createElement("div");
  div.innerHTML = b;
  let a1 = div.getElementsByTagName("a");
  let arr = Array.from(a1);
  let container = document.querySelector(".container");
  for (let index = 0; index < arr.length; index++) {
    const e = arr[index];
    if (e.href.includes("/Songs")) {
      let folder = e.href.split("/").slice(-2)[0];
      let c = await fetch(`/js/Songs/${folder}/info.json`);
      let response = await c.json();
      let title = decodeURI(response.title);
      container.innerHTML =
        container.innerHTML +
        `<div data-folder="${folder}" class="cards">
        <img class="cover" src="/js/Songs/${folder}/cover.jpg" alt="">
        <h2 class="heading">${title}</h2>
        <p class="details">${response.description}</p>
    </div>`;
    }
  }
}

async function getSongs(folder) {
  let a = await fetch(`http://127.0.0.1:3000/js/Songs/${folder}/`);
  let b = await a.text();
  let div = document.createElement("div");
  div.innerHTML = b;
  let a1 = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < a1.length; index++) {
    if (a1[index].href.endsWith(".mp3")) {
      songs.push(a1[index].href.split(`${folder}/`)[1].split(".mp3")[0]);
    }
  }
  return songs;
}

function playBtn() {
  if (audio.paused) {
    audio.play();
    play.src = "/js/SVGs/pause.svg";
    vdo.play();
  } else if (audio.played) {
    audio.pause();
    play.src = "/js/SVGs/play.svg";
    vdo.pause();
  }
}

async function main() {
  let songs = [];
  await getPlaylists();

  Array.from(document.querySelectorAll(".cards")).forEach((e) => {
    e.addEventListener("click", async (f) => {
      curfol = f.currentTarget.getAttribute("data-folder");
      console.log(curfol);
      //To get the songs
      songs = await getSongs(`${curfol}`);

      //To display songs on the playlist
      let songul = document
        .querySelector(".list")
        .getElementsByTagName("ul")[0];
      songul.innerHTML = "";
      let i = 0;
      for (const song of songs) {
        i++;
        songul.innerHTML =
          songul.innerHTML +
          `<li> ${song.replaceAll(
            "%20",
            " "
          )} <img id="${i}" src="/js/SVGs/play.svg" alt="play"> </li>`;
      }

      // To play music
      let array = Array.from(
        document.querySelector(".list").getElementsByTagName("li")
      );
      array.forEach((e) => {
        e.addEventListener("click", () => {
          audio.src = `/js/Songs/${curfol}/` + e.innerText + ".mp3";
          audio.play();
          play.src = "/js/SVGs/pause.svg";
          vdo.play();
          document.querySelector(".info").innerText = e.innerText;
        });
      });
    });
  });

  //Buttons of playbar
  play.addEventListener("click", () => {
    playBtn();
  });

  prev.addEventListener("click", () => {
    let currentIndex = songs.indexOf(
      audio.src.split(`/${curfol}/`)[1].split(".mp3")[0]
    );
    if (currentIndex > 0) {
      audio.pause();
      audio.src = `/js/Songs/${curfol}/` + songs[currentIndex - 1] + ".mp3";
      playBtn();
      document.querySelector(".info").innerText = decodeURI(
        songs[currentIndex - 1]
      );
    } else if (currentIndex == 0) {
      audio.currentTime = 0;
    }
  });

  next.addEventListener("click", () => {
    let currentIndex = songs.indexOf(
      audio.src.split(`/${curfol}/`)[1].split(".mp3")[0]
    );
    if (currentIndex < songs.length - 1) {
      audio.pause();
      audio.src = `/js/Songs/${curfol}/` + songs[currentIndex + 1] + ".mp3";
      playBtn();
      document.querySelector(".info").innerText = decodeURI(
        songs[currentIndex + 1]
      );
    } else if (currentIndex == songs.length - 1) {
      audio.currentTime = 0;
    }
  });

  //Changes regarding time
  audio.addEventListener("timeupdate", () => {
    document.querySelector(".time").innerHTML = `${secToMin(
      audio.currentTime
    )} / ${secToMin(audio.duration)}`;

    //Playbar
    document.querySelector(".circle").style.left =
      (audio.currentTime / audio.duration) * 100 + "%";
    if (audio.currentTime == audio.duration) {
      play.src = "/js/SVGs/play.svg";
      vdo.pause();
    }
  });

  document.querySelector(".line").addEventListener("click", (e) => {
    document.querySelector(".circle").style.left =
      (e.offsetX / e.target.getBoundingClientRect().width) * 100 + "%";
    audio.currentTime =
      (e.offsetX / e.target.getBoundingClientRect().width) * audio.duration;
  });

  document.querySelector("#ham").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0%";
  });

  document.querySelector("#close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
  });

  document.querySelector("#volume").addEventListener("change", (e) => {
    audio.volume = e.target.value / 100;
  });

  document.querySelector("#v").addEventListener("click", () => {
    if (audio.volume == 0) {
      v.src = "/js/SVGs/volume.svg";
      document.querySelector("#volume").value = 1;
      audio.volume = 0.01;
    } else if (audio.volume != 0) {
      v.src = "/js/SVGs/mute.svg";
      document.querySelector("#volume").value = 0;
      audio.volume = 0;
    }
  });
}
main();
