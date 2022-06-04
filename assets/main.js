const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const PLAYER_STORAGE_KEY = 'MY_PLAYER';

const CD = $('.CD');
const curSongName = $('header h2');
const CDThumb = $('.CD-thumbnails');
const audio = $('#audio');
const player = $('.player');
const playlist = $('.playlist');
const progress = $('#progress');
const prevBTN = $('.prev-btn');
const nextBTN = $('.next-btn');
const playBTN = $('.toogle-play-btn');
const shuffleBTN = $('.shuffle-btn');
const repeatBTN = $('.repeat-btn');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: 'Akuma no Ko',
            singer: 'Ai Higuchi',
            path: './music/Akuma No Ko - Ai Higuchi.mp3',
            image: './images/AkumaNoKo.png'
        },
        
        {
            name: '廻廻奇譚',
            singer: 'Eve',
            path: './music/Kaikai Kitan - Eve.mp3',
            image: './images/廻廻奇譚.png'
        },
        
        {
            name: 'Gurenge',
            singer: 'LiSA',
            path: './music/Gurenge - LiSA.mp3',
            image: './images/Nezuko-chan.png'
        },

        {
            name: 'Zankyou Sanka',
            singer: 'Aimer',
            path: './music/Zankyosanka-Aimer-7124836.mp3',
            image: './images/ZankyouSanka.png'
        },
    
        {
            name: 'Hikaru Nara',
            singer: 'Goose House',
            path: './music/Hikaru nara - Goose house.mp3',
            image: './images/HikaruNaraCover.png'
        },
    
        {
            name: 'Orange',
            singer: '7!!',
            path: './music/Orange - 7!!.mp3',
            image: './images/Orange_7!!.png'
        },

        {
            name: 'Lemon',
            singer: 'Kenshi Yonezu',
            path: './music/Lemon - Kenshi Yonezu.mp3',
            image: './images/Lemon.png'
        },

        {
            name: 'Inferno',
            singer: 'Mrs. GREEN APPLE',
            path: './music/Inferno - Mrs_ GREEN APPLE.mp3',
            image: './images/Inferno.png'
        },

        {
            name: 'FLY HIGH',
            singer: 'BURNOUT SYNDROMES',
            path: './music/FLY HIGH!! - BURNOUT SYNDROMES.mp3',
            image: './images/FlyHigh.png'
        },

        {
            name: 'Kibou no Uta',
            singer: 'Ultra Tower',
            path: './music/Kibou no Uta - Ultra Tower.mp3',
            image: './images/KibouNoUta.png'
        },

        {
            name: 'Yoru ni Kakeru',
            singer: 'YOASOBI',
            path: './music/YoruNiKakeru.mp3',
            image: './images/YoruNiKakeru.png'
        },
    ],

    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },

    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
                <div class="thumb" style="background-image: url(${song.image})"></div>
                
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <h5 class="singer">${song.singer}</h5>
                </div>
                
                <div class="option">
                    <i class="fas fa-sliders"></i>
                </div>
            </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('');
    },
            
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
        get: function() {
            return this.songs[this.currentIndex];
        }
      })  
    },

    handleEvents: function() {
        const _this = this;
        const CDWidth = CD.offsetWidth;

        const CDThumbAnimated = CDThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10s
            iterations: Infinity
        })
        CDThumbAnimated.pause();

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCDWidth = CDWidth - scrollTop;

            CD.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0;
            CD.style.opacity = newCDWidth / CDWidth;
        }

        playBTN.onclick = function() {
            if(_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            CDThumbAnimated.play();
        }

        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            CDThumbAnimated.pause();
        }

        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
            }
        }

        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        nextBTN.onclick = function() {
            if(_this.isShuffle) {
                _this.shuffleSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        prevBTN.onclick = function() {
            if(_this.isShuffle) {
                _this.shuffleSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        shuffleBTN.onclick = function() {
            _this.isShuffle = !_this.isShuffle;
            _this.setConfig('isShuffle', _this.isShuffle)
            shuffleBTN.classList.toggle('active', _this.isShuffle);
        }

        repeatBTN.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBTN.classList.toggle('active', _this.isRepeat)
        }

        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if(songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.getAttribute('data-index'));
                    _this.loadCurSongs();
                    _this.render();
                    audio.play();
                }
            }
        }

        audio.onended = function() {
            if(_this.isRepeat) {
                audio.play();
            } else {
                nextBTN.click();
            }
        }
    },

    loadCurSongs: function() {
        curSongName.textContent = this.currentSong.name;
        CDThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },

    loadConfig: function() {
        this.isShuffle = this.config.isShuffle;
        this.isRepeat = this.config.isRepeat;
    },

    scrollToActiveSong: function() {
        setTimeout(function() {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 200);
    },
    
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurSongs();
    },

    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurSongs();
    },

    shuffleSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);

        this.currentIndex = newIndex;
        this.loadCurSongs();
    },

    start: function() {
        this.loadConfig();
        this.defineProperties();
        this.handleEvents();
        this.loadCurSongs();
        this.render();

        shuffleBTN.classList.toggle('active', this.isShuffle);
        repeatBTN.classList.toggle('active', this.isRepeat);   
    }
}

app.start();