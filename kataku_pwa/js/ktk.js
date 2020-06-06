class Carousel {

    constructor(element) {
        this.board = element
        // add first two cards programmatically
        this.push()
        this.push()
        // handle gestures
        this.handle()
    }

    handle() {

        // list all cards
        this.cards = this.board.querySelectorAll('.card')

        // get top card
        this.topCard = this.cards[this.cards.length - 1]

        // get next card
        this.nextCard = this.cards[this.cards.length - 2]

        // if at least one card is present
        if (this.cards.length > 0) {

            // set default top card position and scale
            this.topCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'

            // destroy previous Hammer instance, if present
            if (this.hammer) this.hammer.destroy()

            // listen for tap and pan gestures on top card
            this.hammer = new Hammer(this.topCard)
            this.hammer.add(new Hammer.Tap())
            this.hammer.add(new Hammer.Pan({ position: Hammer.position_ALL, threshold: 0 }))

            // pass events data to custom callbacks
            this.hammer.on('tap', (e) => { this.onTap(e) })
            this.hammer.on('pan', (e) => { this.onPan(e) })
        }
    }

    onTap(e) {

        // get finger position on top card
        let propX = (e.center.x - e.target.getBoundingClientRect().left) / e.target.clientWidth

        // get degree of Y rotation (+/-15 degrees)
        let rotateY = 15 * (propX < 0.05 ? -1 : 1)

        // change the transition property
        this.topCard.style.transition = 'transform 100ms ease-out'

        // rotate
        this.topCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(' + rotateY + 'deg) scale(1)'

        // wait transition end
        setTimeout(() => {
            // reset transform properties
            this.topCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
        }, 100)

    }

    onPan(e) {

        if (!this.isPanning) {

            this.isPanning = true

            // remove transition properties
            this.topCard.style.transition = null
            if (this.nextCard) this.nextCard.style.transition = null

            // get top card coordinates in pixels
            let style = window.getComputedStyle(this.topCard)
            let mx = style.transform.match(/^matrix\((.+)\)$/)
            this.startPosX = mx ? parseFloat(mx[1].split(', ')[4]) : 0
            this.startPosY = mx ? parseFloat(mx[1].split(', ')[5]) : 0

            // get top card bounds
            let bounds = this.topCard.getBoundingClientRect()

            // get finger position on top card, top (1) or bottom (-1)
            this.isDraggingFrom = (e.center.y - bounds.top) > this.topCard.clientHeight / 2 ? -1 : 1

        }

        // calculate new coordinates
        let posX = e.deltaX + this.startPosX
        let posY = e.deltaY + this.startPosY

        // get ratio between swiped pixels and the axes
        let propX = e.deltaX / this.board.clientWidth
        let propY = e.deltaY / this.board.clientHeight

        // get swipe direction, left (-1) or right (1)
        let dirX = e.deltaX < 0 ? -1 : 1

        // calculate rotation, between 0 and +/- 45 deg
        let deg = this.isDraggingFrom * dirX * Math.abs(propX) * 45

        // calculate scale ratio, between 95 and 100 %
        let scale = (95 + (5 * Math.abs(propX))) / 100

        // move top card
        this.topCard.style.transform = 'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg) rotateY(0deg) scale(1)'

        // scale next card
        if (this.nextCard) this.nextCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(' + scale + ')'

        if (e.isFinal) {

            this.isPanning = false

            let successful = false

            // set back transition properties
            this.topCard.style.transition = 'transform 200ms ease-out'
            if (this.nextCard) this.nextCard.style.transition = 'transform 100ms linear'

            // check threshold
            if (propX > 0.05 && e.direction == Hammer.DIRECTION_RIGHT) {

                successful = true
                // get right border position
                posX = this.board.clientWidth

            } else if (propX < -0.05 && e.direction == Hammer.DIRECTION_LEFT) {

                successful = true
                // get left border position
                posX = - (this.board.clientWidth + this.topCard.clientWidth)

            } else if (propY < -0.05 && e.direction == Hammer.DIRECTION_UP) {

                successful = true
                // get top border position
                posY = - (this.board.clientHeight + this.topCard.clientHeight)
            }

            if (successful) {
                // throw card in the chosen direction
                this.topCard.style.transform = 'translateX(' + posX + 'px) translateY(' + posY + 'px) rotate(' + deg + 'deg)'
                if (window.screen.availWidth < 800) {
                    var tempsAttente = 500
                }
                else {
                    var tempsAttente = 200
                }
                // wait transition end
                setTimeout(() => {
                    // remove swiped card
                    this.board.removeChild(this.topCard)
                    // add new card
                    this.push()
                    // handle gestures on new top card
                    this.handle()
                }, tempsAttente)
            } else {
                // reset cards position
                this.topCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(1)'
                if (this.nextCard) this.nextCard.style.transform = 'translateX(-50%) translateY(-50%) rotate(0deg) rotateY(0deg) scale(0.95)'
            }
        }
    }

    push() {
        let card = document.createElement('div')
        // C'EST ICI QUON CHANGE L'HTML DE LA CARTE.            ---   --  -    ---    - - -         --      ----             - ---         ----              --  -- --- - --  --
        card.classList.add('card')

        var carte_choisie = Math.floor(Math.random() * contenu.length);
        var rand = contenu[carte_choisie];
        var joueurs_appeles = (rand.match(/<j/g) || []).length;
        var jrs_locaux = [];
        var jrs_filtres = [...joueurs];     //copie pure de la liste, pas de reference

        for (var i = 0; i < joueurs_appeles; i++) {
            var index_alea = Math.floor(Math.random() * jrs_filtres.length)
            jrs_locaux.push(jrs_filtres[index_alea])
            jrs_filtres.splice(index_alea, 1)
        };

        card.innerHTML = '<div class="cardcont"><h4 style="margin-top:15%">' + titles[carte_choisie] + '</h4>  <img class="brainlet" src="images/bouteilles_res24.png"> <div class="consigne">' + rand.replace('<j1>', jrs_locaux[0]).replace('<j2>', jrs_locaux[1]).replace('<j3>', jrs_locaux[2]) + '</div><div class="logoktk" style="top:97.5%;"><img class="logobot" src="images/logo_kataku_transpar.png"/></div></div>'

        if (this.board.firstChild) {
            this.board.insertBefore(card, this.board.firstChild);
        } else {
            this.board.append(card);
        }
    }
}