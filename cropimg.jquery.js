/**
 * Available for use under the MIT License (http://en.wikipedia.org/wiki/MIT_License)
 * 
 * Copyright (c) 2014 - 2015 by Adam Banaszkiewicz
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * @version 0.3.0
 * @date    2015.08.09
 * @author  Adam Banaszkiewicz
 */
(function($){
  /**
   * Zwraca obiekt z szerokością strony.
   * 
   * @result object
   */
  document.getWindowWidth = function() {
    if( typeof( window.innerWidth ) == 'number' )
    {
      return window.innerWidth;
    }
    else if(document.documentElement && (document.documentElement.clientWidth || document.documentElement.clientHeight))
    {
      return document.documentElement.clientWidth;
    }
    else if(document.body && (document.body.clientWidth || document.body.clientHeight))
    {
      return document.body.clientWidth;
    }
    
    return 1280;
  };

  $.fn.cropimg = function(options) {
    options = $.extend({
      /**
       * Maksymalna szerokość kontenera z narzędziami. Null oznacza 100%.
       * 
       * @var integer
       * @var null
       */
      maxContainerWidth: null,
      
      /**
       * Szerokość obrazka po kadrowaniu.
       * 
       * @var integer
       */
      resultWidth: 100,
      
      /**
       * Wysokość obrazka po kadrowaniu.
       * 
       * @var integer
       */
      resultHeight: 100,
      
      /**
       * Przedrostek ID elementów INPUT do których wrzucane będą dane na temat
       * pozycji obrazka oraz zaznaczonej jego części.
       * 
       * @var string
       */
      inputPrefix: '',
      
      /**
       * Opóźnienie w czasie, pomiędzy jednorazowym zoomem, a zoomem 
       * wielokrotnym. Wartośc podawana w milisekundach.
       * 
       * @var integer
       */
      zoomDelay: 400,
      
      /**
       * krotność przybliżenia dla kółka myszki.
       * 
       * @var integer
       */
      mouseWheelZoomTimes: 10,

      /**
       * O jaką część całości ma odbywać się zoomowanie.
       * 
       * @type integer
       */
      zoomStep: 1,
      
      /**
       * Czy pokazywać tooltipy na buttonach?
       * 
       * @var boolean
       */
      showBtnTips: true,
      
      /**
       * Czas animacji pokazywania i ukrywania tooltipów.
       * 
       * @var integer
       */
      btnTipsFadeTime: 100,
      
      /**
       * Treść tooltipa przycisku: przybliż.
       * 
       * @var string
       */
      textBtnTipZoomIn: 'Zoom in',
      
      /**
       * Treść tooltipa przycisku: oddal.
       * 
       * @var string
       */
      textBtnTipZoomOut: 'Zoom out',
      
      /**
       * Treść tooltipa przycisku: dopasuj do szerokości.
       * 
       * @var string
       */
      textBtnTipRTW: 'Resize to container width',
      
      /**
       * Treść tooltipa przycisku: dopasuj do wydokości.
       * 
       * @var string
       */
      textBtnTipRTH: 'Resize to container height',
      
      /**
       * Treść tooltipa przycisku: przenieś w lewy górny róg.
       * 
       * @var string
       */
      textBtnTipFPTL: 'Move image to Top Left Corner',
      
      /**
       * Treść tooltipa przycisku: przenieś w górę na środek.
       * 
       * @var string
       */
      textBtnTipFPTC: 'Move image to Top Center',
      
      /**
       * Treść tooltipa przycisku: przenieś w prawy górny róg.
       * 
       * @var string
       */
      textBtnTipFPTR: 'Move image to Top Right Corner',
      
      /**
       * Treść tooltipa przycisku: przenieś w lewo na środek.
       * 
       * @var string
       */
      textBtnTipFPCL: 'Move image to Center Left',
      
      /**
       * Treść tooltipa przycisku: przenieś na sam środek kontenera.
       * 
       * @var string
       */
      textBtnTipFPCC: 'Move image to Center of container',
      
      /**
       * Treść tooltipa przycisku: przenieś w prawo na środek.
       * 
       * @var string
       */
      textBtnTipFPCR: 'Move image to Center Right',
      
      /**
       * Treść tooltipa przycisku: przenieś w dolny lewy róg.
       * 
       * @var string
       */
      textBtnTipFPBL: 'Move image to Bottom Left Corner',
      
      /**
       * Treść tooltipa przycisku: przenieś w dolny róg na środek.
       * 
       * @var string
       */
      textBtnTipFPBC: 'Move image to Bottom Center',
      
      /**
       * Treść tooltipa przycisku: przenieś w dolny prawy róg.
       * 
       * @var string
       */
      textBtnTipFPBR: 'Move image to Bottom Right Corner',
      
      /**
       * Wywoływana podczas inicjacji pluginu.
       * 
       * @var function
       */
      onInit: function() {},
      
      /**
       * Wywoływana podczas zmiany zoomu, lub pozycji obrazka.
       * 
       * @var function
       */
      onChange: function(w, h, x, y, img) {}
    }, options);

    var CI_Main = function(image, options) {
      this.options = options;

      /**
       * Przechowuje informacje, czy obrazek został już zmieniony, czy jeszcze
       * nic user nie robił.
       * 
       * @var boolean
       */
      this.changed = false;

      /**
       * Obiekt jQuery z obrazkiem.
       * 
       * @var jQuery
       */
      this.image = image;
      
      /**
       * Obiekt z danymi na temat obrazka.
       * 
       * @var jQuery
       */
      this.imageData = {};
      
      /**
       * Obiekt jQuery z głównym kontenerem w którym znajduje się cały plugin.
       * 
       * @var jQuery
       */
      this.container = null;
      
      /**
       * Obiekt jQuery z kontenerem obrazka.
       * 
       * @var jQuery
       */
      this.imageContainer = null;
      
      /**
       * Obiekt z danymi na temat kontenera obrazka.
       * 
       * @var jQuery
       */
      this.imgCntData = {width: -1};
      
      /**
       * Przechowuje czas w mikrosekundach wywołania pluginu. Potrzebne do
       * nadawania ID elementom.
       * 
       * @var integer
       */
      this.mt = (new Date()).getTime() + Math.floor((Math.random() * 1000) + 1);
      
      this.vars = {
        x: 0,
        y: 0,
        w: 0,
        h: 0
      };

      this.ToolDrawer = null;
      this.BtnTips = null;
      this.Movable = null;
      this.Zooming = null;
      this.CroppingResult = null;
      this.Reset = null;
    };

    /**
     * Obiekt z metodami do rysowania narzędzi pluginu.
     */
    var CI_TOOLDRAWER = function(main) {
      this.main = main;

      /**
       * Domyślna metoda obiektu.
       */
      this.draw = function() {
        this.drawContainers();
        
        this.drawZoomingButtons();
        
        this.drawFixingPositionButtons();
        
        this.drawFixingSizeButtons();

        var self = this;
        
        $(window).resize(function(e) {
          self.onResize(self, e);
        });
      };

      /**
       * Rysuje kontenery (DIV) i te ważniejsze przypisuje do zmiennych.
       * 
       * @return void
       */
      this.drawContainers = function() {
        // Tworzymy główny kontener na aplikację
        this.main.image.wrap($('<div />', {'class':'ci-main','id':'ci-main-'+this.main.mt,'style':'max-width:'+this.main.options.resultWidth+'px'}));
        this.main.container = $('.ci-main#ci-main-'+this.main.mt);
        
        // Tworzymy kontener bezpośrednio na zdjęcie
        this.main.image.wrap($('<div />', {'class':'ci-image-wrapper','id':'ci-image-wrapper-'+this.main.mt,'style':'max-width:'+this.main.options.resultWidth+'px;height:'+this.main.options.resultHeight+'px'}));
        this.main.imageContainer = $('.ci-image-wrapper#ci-image-wrapper-'+this.main.mt);
        
        // Kontener na "przybliż - oddal"
        this.main.container.append($('<div />', {'class':'ci-tool ci-zooming'}));
      };

      /**
       * Tworzy buttony "przybliż - oddal".
       * 
       * @return void
       */ 
      this.drawZoomingButtons = function() {
        this.main.container.find('.ci-tool.ci-zooming')
          .append($('<span />', {'title':this.main.options.textBtnTipZoomIn,'href':'#','class':'ci-button ci-tool-zoomin'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipZoomOut,'href':'#','class':'ci-button ci-tool-zoomout'}).click(function(){return false;}));
      },

      /**
       * Rysuje buttony przesuwania zdjęcia do krawędzi i rogów kontenera.
       * 
       * @return void
       */
      this.drawFixingPositionButtons = function() {
        this.main.imageContainer
          .append($('<span />', {'title':this.main.options.textBtnTipFPTL,'href':'#','class':'ci-fixing-position ci-fptl'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPTC,'href':'#','class':'ci-fixing-position ci-fptc'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPTR,'href':'#','class':'ci-fixing-position ci-fptr'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPCL,'href':'#','class':'ci-fixing-position ci-fpcl'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPCC,'href':'#','class':'ci-fixing-position ci-fpcc'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPCR,'href':'#','class':'ci-fixing-position ci-fpcr'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPBL,'href':'#','class':'ci-fixing-position ci-fpbl'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPBC,'href':'#','class':'ci-fixing-position ci-fpbc'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipFPBR,'href':'#','class':'ci-fixing-position ci-fpbr'}).click(function(){return false;}));
      },

      /**
       * Rysuje buttony zmiany rozmiarów zdjęcia względem kontenera.
       * 
       * @return void
       */
      this.drawFixingSizeButtons = function() {
        this.main.container.find('.ci-tool.ci-zooming')
          .append($('<span />', {'title':this.main.options.textBtnTipRTW,'href':'#','class':'ci-fixing-size ci-fsw'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipRTH,'href':'#','class':'ci-fixing-size ci-fsh'}).click(function(){return false;}));
      },

      /**
       * Rysuje buttony zmiany rozmiarów zdjęcia względem kontenera.
       * 
       * @return void
       */
      this.drawFixingSizeButtons = function() {
        this.main.container.find('.ci-tool.ci-zooming')
          .append($('<span />', {'title':this.main.options.textBtnTipRTW,'href':'#','class':'ci-fixing-size ci-fsw'}).click(function(){return false;}))
          .append($('<span />', {'title':this.main.options.textBtnTipRTH,'href':'#','class':'ci-fixing-size ci-fsh'}).click(function(){return false;}));
      },

      this.onResize = function(self, e) {
        /**
         * Jeśli szerokość kontenera zdjęcia jest mniejsza niż szerokość
         * domyślna zaznaczenia to zmniejszamy wysokość proporcjonalnie
         * do zmniejszonej szerokości by zachować proporcje.
         */
        if(self.main.imageContainer.width() < self.main.options.resultWidth)
        {
          self.main.imgCntData.proportionsToOriginal  = self.main.imageContainer.width() / self.main.options.resultWidth;
          self.main.imageContainer.css('height', (self.main.options.resultHeight * self.main.imgCntData.proportionsToOriginal)+'px');
          
          // Uaktualniamy dane na temat kontenera obrazka
          self.main.imgCntData.width   = self.main.imageContainer.width();
          self.main.imgCntData.height  = self.main.imageContainer.height();
          
          // Uaktualniamy dane na temat zaznaczonego obszaru zdjęcia
          self.main.CroppingResult.cropPercent = self.main.imgCntData.proportionsToOriginal;
        }
        /**
         * W każdym innym wypadku ustawiamy wysokość kontenera na domyślną
         * wysokość kadrowanego obrazu oraz ustawiamy proporcje kontenera
         * na 1 - czyli nieprzeskalowane (oryginał).
         */
        else
        {
          self.main.imageContainer.css('height', self.main.options.resultHeight);
          
          // Uaktualniamy dane na temat kontenera obrazka
          self.main.imgCntData.width   = self.main.imageContainer.width();
          self.main.imgCntData.height  = self.main.options.resultHeight;
          self.main.imgCntData.proportionsToOriginal = 1;
        }
        
        // Odświeżamy wartości
        if(self.main.changed)
        {
          self.main.Zooming.eventMouseUp();
        }
      }
    };


    /**
     * Obiekt z metodami do zarządzania tooltipami przycisków.
     */
    var CI_BTNSTIPS = function(main) {
      this.main = main;

      /**
       * Przechowuje ID tooltipu, który aktualnie jest dodawany do BODY.
       * 
       * @var string
       */
      this.currentTipId = '';

      /**
       * Przechowuje ID tooltipu, który aktualnie jest już BODY, który można usunąć.
       * 
       * @var string
       */
      this.lastTipId = '';

      /**
       * Inicjacja tooltipów
       * 
       * @return void
       */
      this.init = function() {
        var self = this;

        // Tylko, jeśli tak wybrano.
        if(this.main.options.showBtnTips == false)
        {
          return false;
        }
        
        /**
         * Szukamy wszystkie elementy, które posiadają atrybut title. Treść
         * z TITLE wrzucamy do DATA-TXT i usuwamy TITLE a następnie
         * podpinamy zdarzenia na hover.
         */
        $('[title]', this.main.container).add($('[title]', this.main.imageContainer)).each(function() {
          $(this).attr('data-txt', $(this).attr('title'))
            .removeAttr('title')
            .hover(function() {
              self.main.BtnTips.show(self, this);
            }, function() {
              self.main.BtnTips.hide(self, this);
            });
        });
      },

      /**
       * Pokazuje tooltip. Podpinane na zdarzenie elementu mouseenter.
       * 
       * @return void
       */
      this.show = function(self, elm) {
        // Tworzymy nowe ID tooltipu
        self.currentTipId = 'ci-tip-'+(new Date()).getTime();
        
        // Dodajemy Tooltip do body
        $('body').append($('<span class="ci-tip" id="'+self.currentTipId+'">'+$(elm).attr('data-txt')+'</span>').fadeTo(0, 0).fadeTo(self.main.options.btnTipsFadeTime, 1));
        
        // Pobieramy offset elementu, do którego należy tooltip
        var elmOffset = $(elm).offset(),
            // Pobieramy przed chwilą dodany do BODY tooltip
            tip       = $('body').find('.ci-tip#'+self.currentTipId);
        
        // Obliczamy pozycję nowego toltipa
        tip.css({
          'left': elmOffset.left - (tip.outerWidth() / 2) + ($(elm).outerWidth() / 2),
          'top' : elmOffset.top - (tip.outerHeight()) - (($(elm).outerHeight() - 5) / 2)
        });
        
        // Przepisujemy ID tooltipa z Aktualy na Ostatni
        self.lastTipId = self.currentTipId;
      },

      /**
       * Ukrywa a następnie usuwa tooltip. Dodatkowe zdarzenie pozwala
       * ukryć element od razu, po najechaniu na niego, a nie czekać aż ukryje
       * się on animacją fade. Podpinane na zdarzenie elementu mouseout.
       * 
       * @return void
       */
      this.hide = function() {
        $('body').find('.ci-tip#'+this.lastTipId).hover(function() {$(this).remove();}, $.noop).fadeTo(this.main.options.btnTipsFadeTime, 0, function() {
          $(this).remove();
        });
      }
    };


    var CI_MOVABLE = function(main) {
      this.main = main;

      /**
       * Przechowuje obiekt z wartościami pozycji myszki na której był kursor,
       * podczas rozpoczęcia przesuwania obrazka.
       *  
       * @var object
       */
      this.mousePositionStart = {
        x:0,
        y:0
      };

      this.imagePosition = {
        'left':0,
        'top':0
      };

      /**
       * Przechowuje informacje dla metod Eventów o tym,
       * czy przycisk myszki jest wciśnięty - mousedown.
       */
      this.mouseDowned = false;

      /**
       * Metoda inicjująca.
       */
      this.init = function() {
        var self = this;

        /**
         * Po kliknięciu na kontener obrazka rozpoczynamy przesuwanie zdjęcia.
         */
        this.main.imageContainer.bind('mousedown', function(e) {
          self.eventMouseDown(self, e);
        });

        $('body')
          /**
           * Podczas jeżdżenia po BODY przesuwamy obrazek względem pozycji myszki.
           */
          .bind('mousemove', function(e) {
            self.eventMouseMove(self, e);
          })
          /**
           * Po puszczeniu przycisku myszki kończymy przesuwanie.
           */
          .bind('mouseup', function(e) {
            self.eventMouseUp(self, e);
          });
        
        /**
         * Dzięki temu, po kliknięciu na obrazek i próbie "przeniesienia go"
         * nie wykona się domyślna reakcja przeglądarki.
         */
        var _sp = function(e) {
          e.preventDefault();
        };
        
        this.main.imageContainer.find('img')
          .bind('mousemove', _sp)
          .bind('mouseup', _sp)
          .bind('mousedown', _sp);
        
        this.bindFixingButtons();
      },

      /**
       * Metoda eventu onmousedown. Zapisuje pozycję myszki oraz obrazka
       * by można było obliczyć nową pozycję podczas przenosin. Podpina
       * zdarzenia przenoszenia dla BODY.
       * 
       * @event onmousedown
       * @param object e
       * @return void
       */
      this.eventMouseDown = function(self, e) {
        if(self.mouseDowned === false)
        {
          // Zapisujemy pozycję myszki
          self.mousePositionStart.x = e.pageX;
          self.mousePositionStart.y = e.pageY;
          
          // Potrzebujemy te dane o obrazku by móc dobrze go przesunąć z tych wartości początkowych
          self.imagePosition.left = parseInt(self.main.image.css('left').replace('px', ''));
          self.imagePosition.top  = parseInt(self.main.image.css('top').replace('px', ''));
          
          // Ustawiamy, że już było zmieniane
          self.main.changed = true;

          self.mouseDowned = true;
        }
      },

      /**
       * Metoda eventu onmouseup. Zdejmuje zdarzenia przenosin z BODY.
       * 
       * @event onmouseup
       * @return void
       */
      this.eventMouseUp = function(self, e) {
        if(self.mouseDowned === true)
        {
          self.mouseDowned = false;

          /**
           * Uaktualniamy pozycję obrazka. Robimy to tutaj a nie w funkcji
           * przesuwania ponieważ tam zabierałaby niepotrzebnie moc obliczeniową
           * przeglądarki wrzucając co jeden piksel dane do inputów a tak
           * oblicza pozycję tylko raz i tylko raz wrzuca ją do inputów.
           */
          self.main.CroppingResult.update(parseInt(self.main.image.css('left').replace('px', '')), parseInt(self.main.image.css('top').replace('px', '')));

          /**
           * Może zdarzyć się tak, że użytkownik tylko kliknie w przeniesienie
           * obrazka do którejś z krawędzi. W ten sposób (jeśli nie ma) dodadzą
           * się pozycje X i Y obrazka lub uaktualnią, ale nic nie stanie się
           * z wartościami W i H obrazka - więc jeśli ich tam nie było, to po
           * uaktualnieniu ich nadal nie będzie (lub będzie 0 i 0), dla tego
           * musimy tutaj sztucznie wymusić ustawienie wartości W i H obrazka.
           */
          self.main.Zooming.eventMouseUp();
        }
      },

      /**
       * Metoda eventu onmousemove. Za pomocą metody pomocniczej oblicza
       * pozycję obrazka i przesuwa go.
       * 
       * @event onmousemove
       * @param object e
       * @return void
       */
      this.eventMouseMove = function(self, e) {
        if(self.mouseDowned === true)
        {
          // Ustawiamy, że już było zmieniane
          self.main.changed = true;
          
          // Obliczamy nowe pozycje i przesuwamy obrazek.
          self.main.image.css(self.calculatePosition(e.pageX, e.pageY));
        }
      },

      /**
       * Podpina funkcje pod przyciski w kontenerze zdjęcia odpowiedzialne
       * za przesunięcie zdjęcia do danej krawędzi lub rogu kontenera.
       * 
       * @return void
       */
      this.bindFixingButtons = function() {
        var self = this;

        // Top left
        this.main.imageContainer.find('.ci-fixing-position.ci-fptl').mouseup(function() {
          self.main.image.css({'top':'0px','left':'0px'});
          self.main.vars.x = 0;
          self.main.vars.y = 0;
          self.main.CroppingResult.update(0, 0);

        });
        
        // Top center
        this.main.imageContainer.find('.ci-fixing-position.ci-fptc').mouseup(function() {        
          var left = -((self.main.imageData.width / 2) - (self.main.imgCntData.width / 2));
          self.main.image.css({'top':'0px','left':left+'px'});
          self.main.vars.x = 0;
          self.main.vars.y = left;
          self.main.CroppingResult.update(left, 0);

        });
        
        // Top right
        this.main.imageContainer.find('.ci-fixing-position.ci-fptr').mouseup(function() {
          var left = -(self.main.imageData.width - self.main.imgCntData.width);
          self.main.image.css({'top':'0px','left':left+'px'});
          self.main.vars.x = 0;
          self.main.vars.y = left;
          self.main.CroppingResult.update(left, 0);

        });
        
        // Center left
        this.main.imageContainer.find('.ci-fixing-position.ci-fpcl').mouseup(function() {
          var top = -((self.main.imageData.height / 2) - (self.main.imgCntData.height / 2));
          self.main.image.css({'top':top+'px','left':'0px'});
          self.main.vars.x = 0;
          self.main.vars.y = top;
          self.main.CroppingResult.update(0, top);

        });
        
        // Center center
        this.main.imageContainer.find('.ci-fixing-position.ci-fpcc').mouseup(function() {
          var top   = -((self.main.imageData.height / 2) - (self.main.imgCntData.height / 2));
          var left  = -((self.main.imageData.width / 2) - (self.main.imgCntData.width / 2));
          self.main.image.css({'top':top+'px','left':left+'px'});
          self.main.vars.x = left;
          self.main.vars.y = top;
          self.main.CroppingResult.update(left, top);

        });
        
        // Center right
        this.main.imageContainer.find('.ci-fixing-position.ci-fpcr').mouseup(function() {
          var top   = -((self.main.imageData.height / 2) - (self.main.imgCntData.height / 2));
          var left  = -(self.main.imageData.width - self.main.imgCntData.width);
          self.main.image.css({'top':top+'px','left':left+'px'});
          self.main.vars.x = left;
          self.main.vars.y = top;
          self.main.CroppingResult.update(left, top);

        });
        
        // Bottom left
        this.main.imageContainer.find('.ci-fixing-position.ci-fpbl').mouseup(function() {
          var top = -(self.main.imageData.height - self.main.imgCntData.height);
          self.main.image.css({'top':top+'px','left':'0px'});
          self.main.vars.x = 0;
          self.main.vars.y = top;
          self.main.CroppingResult.update(0, top);

        });
        
        // Bottom center
        this.main.imageContainer.find('.ci-fixing-position.ci-fpbc').mouseup(function() {
          var top   = -(self.main.imageData.height - self.main.imgCntData.height);
          var left  = -((self.main.imageData.width / 2) - (self.main.imgCntData.width / 2));
          self.main.image.css({'top':top+'px','left':left+'px'});
          self.main.vars.x = left;
          self.main.vars.y = top;
          self.main.CroppingResult.update(left, top);

        });
        
        // Bottom right
        this.main.imageContainer.find('.ci-fixing-position.ci-fpbr').mouseup(function() {
          var top   = -(self.main.imageData.height - self.main.imgCntData.height);
          var left  = -(self.main.imageData.width - self.main.imgCntData.width);
          self.main.image.css({'top':top+'px','left':left+'px'});
          self.main.vars.x = left;
          self.main.vars.y = top;
          self.main.CroppingResult.update(left, top);

        });
      },

      /**
       * Metoda oblicza pozycję obrazka względem pozycji kursora oraz 
       * domyślnej pozycji obrazka tuż przed przenoszeniem i zwraca obiekt
       * z obliczonymi nowymi współrzędnymi obrazka.
       * 
       * @param integer pageX Wartość obiektu event.pageX
       * @param integer pageY Wartość obiektu event.pageY
       * 
       * @return object
       */
      this.calculatePosition = function(pageX, pageY) {
        return {'top':pageY - this.mousePositionStart.y + this.imagePosition.top,'left':pageX - this.mousePositionStart.x + this.imagePosition.left};
      }
    };


    /**
     * Obiekt odpowiedzialny za "przybliż - oddal".
     */
    var CI_ZOOMING = function(main) {
      this.main = main;

      /**
       * Przechowuje obiekt interwału zoomowania.
       * 
       * @var object
       */
      this.interval = null;

      /**
       * Czas, który pozostał, do rozpoczęcia zoomu w petli.
       * 
       * @var integer
       */
      this.timesLeftToZoom = 10;

      /**
       * Przechowuje informacje na temat tego, czy można zastopować
       * zoomowanie podczas zdarzenia mouseup na body.
       * 
       * @var boolean
       */
      this.canStopZoom = false;

      /**
       * Przechowuje funkcję callable z wywołaniem funkcji zoom z parametrem
       * określającym czy ma przybliżać czy oddalać.
       * 
       * @var function
       */
      this.zoomFunction = function() {};

      /**
       * Inicjator.
       */   
      this.init = function() {
        var self = this;

        this.timesLeftToZoom = this.main.options.zoomDelay;

        // Podpinamy zoom dla przycisków
        this.main.container
          .find('.ci-tool.ci-zooming .ci-button')
          .mousedown(function() {
            self.canStopZoom = true;
            self.eventMouseDown($(this).hasClass('ci-tool-zoomin') ? 'in' : 'out');
          })
          .mouseup(function(e) {
            self.eventMouseUp();
            self.canStopZoom = false;
            e.stopPropagation();
          })
          .click(function() {
            self.canStopZoom = false;
            self.eventMouseClick($(this).hasClass('ci-tool-zoomin') ? 'in' : 'out');
          });
        
        // Reset zoom
        $('body').mouseup(function() {
          if(self.canStopZoom)
            self.stopZoom();
        });
        
        /**
         * Musimy pobrać wymiary obrazka, ale nie uda nam się to przed jego 
         * załadowaniem, dlatego tworzymy jeszcze jeden obrazek w kontenerze,
         * podpinamy pod niego zdarzenie, by po wywołaniu pobrało wymiary,
         * i ładujemy go do kontenera. Po załadowaniu usuwamy z kontenera,
         * by nie pozostawić śladów.                  
         */                 
        var loader = document.createElement('IMG');
            loader.className = 'ci-image-loader';
            loader.onload = function() {
              // Dane obrazka
              self.main.imageData = {
                // Oryginalne wymiary obrazka
                originalWidth: self.main.image.width(),
                originalHeight: self.main.image.height(),
                // Aktualne wymiary obrazka
                width: self.main.image.width(),
                height: self.main.image.height(),
                // Poporcje wymiarów obrazka względem oryginalnych
                proportions: 1
              };
              
              $('.ci-image-loader', self.main.imageContainer).remove();
            };
            loader.src = this.main.image.attr('src');
        
        this.main.imageContainer.append(loader);
        
        this.bindFixingButtons();
        
        /**
         * Jeśli jest skrypt mousewheel to podpinamy zoomowanie za pomocą
         * kółka myszki.
         */
        if(typeof this.main.container.mousewheel == 'function')
        {
          this.main.container.mousewheel(function(e) {
            var type = e.deltaY == 1 ? 'in' : 'out';

            for(var i = 0; i < self.main.options.mouseWheelZoomTimes; i++)
              self.zoom(type);

            self.eventMouseUp();

            e.stopPropagation();
            e.preventDefault();
            return false;
          });
        }
      },

      /**
       * Metoda przygotowuje metodę zoomowania w zależności od podanej wartości
       * w parametrze type.
       * 
       * @param string type
       * @return void         
       */
      this.prepareToZoom = function(type) {
        // Ustawiamy, że już było zmieniane
        this.main.changed = true;
        
        // Ustawiamy, że w interwale może być wykonywana funkcja zoomowania
        this.allowedZoomingFromInterval = true;
        
        // Ustawiamy funkcję wywołującą funkcję zoomowania w zależności od typu
        this.zoomFunction = function() {this.zoom(type);};
      },

      /**
       * Metoda rozpoczyna zmianę rozmiaru w zależności od podanego typu.
       * Typ 'in' oznacza przybliżenie; Typ 'out' oznacza oddalenie. Najpierw
       * wykonuje raz funkcję zoomowania, a nastepnie ustawia interval tak, by
       * po wciśnięciu i przytrzymaniu klawisza myszki można było zoomować
       * cały czas bez kolejnych wciśnięć.
       * 
       * @param string type
       * @return false
       */
      this.eventMouseDown = function(type) {
        var self = this;

        // Przygotowujemy metodę do zoomowania
        this.prepareToZoom(type);
        
        // Ustawiamy odliczanie na zoomowanie ciągłe
        this.interval = setInterval(function() {
          self.timesLeftToZoom = self.timesLeftToZoom - 10;
          
          if(self.timesLeftToZoom <= 0)
            self.zoomFunction();
        }, 10);
        
        return false;
      },

      /**
       * Zatrzymanie zmiany rozmiaru.
       * 
       * @return void
       */
      this.eventMouseUp = function() {
        this.main.CroppingResult.update(undefined, undefined, this.main.options.resultWidth * parseFloat(this.main.CroppingResult.cropPercent), this.main.options.resultHeight * parseFloat(this.main.CroppingResult.cropPercent), true);

        this.stopZoom();
      },

      /**
       * Zdarzenie pojedyńczego kliknięcia w przycisk. Jeśli tylko kliknie
       * zoomujemy o jeden stopień.
       * 
       * @param string type
       * @return void
       */
      this.eventMouseClick = function(type) {
        // Zatrzymujemy to co było do tej pory
        this.stopZoom();
        // Przygotowujemy metodę do zoomowania
        this.prepareToZoom(type);
        // Wykonujemy jeden raz funkcję zoomowania
        this.zoomFunction();
      },

      /**
       * Metoda resetuje i stopuje ZOOM.
       * 
       * @return void
       */
      this.stopZoom = function() {
        this.timesLeftToZoom = this.main.options.zoomDelay;
        
        clearInterval(this.interval);
      },

      /**
       * Główna metoda odpowiedzialna za zoomowanie obrazka. Parametr type='in' oznacza
       * przybliżenie, parametr type='out' oznacza oddalenie.
       * 
       * @param string type 'in' lub 'out'
       * @return void
       */
      this.zoom = function(type) {
        // Zmieniamy wielkość procent w zależności od tego, czy przybliżamy czy oddalamy
        if(type == 'in')
          this.main.imageData.proportions = (parseFloat(this.main.imageData.proportions) + (this.main.options.zoomStep / 1000)).toFixed(4);
        else
          this.main.imageData.proportions = (parseFloat(this.main.imageData.proportions) - (this.main.options.zoomStep / 1000)).toFixed(4);
        
        // Maksymalne przybliżenie to 200%
        if(this.main.imageData.proportions >= 2)
          this.main.imageData.proportions = 2;
        
        // Maksymalne oddalenie to 1%
        if(this.main.imageData.proportions <= 0.001)
          this.main.imageData.proportions = 0.001;
        
        
        this.main.imageData.width   = (this.main.imageData.originalWidth * this.main.imageData.proportions);
        this.main.imageData.height  = (this.main.imageData.originalHeight * this.main.imageData.proportions)
        
        // Obliczamy nowe wymiary obrazka względem obliczonych procentów
        var newSizes = this.fixSizes(
          this.main.imageData.originalWidth * this.main.imageData.proportions,
          this.main.imageData.originalHeight * this.main.imageData.proportions
        );
        
        // Zmieniamy rozmiar zdjęcia
        this.main.image.css({
          'width':newSizes.width,
          'height':newSizes.height,
          'max-width':newSizes.width,
          'max-height':newSizes.height,
          'min-width':newSizes.width,
          'min-height':newSizes.height
        });
      },

      /**
       * Podpina funkcje pod przyciski w kontenerze zdjęcia odpowiedzialne
       * za zmianę rozmiaru zdjęcia względem rozmiaru kontenera.
       * 
       * @return void
       */
      this.bindFixingButtons = function() {
        var self = this;

        var update = function() {
          self.main.imageData.width   = (self.main.imageData.originalWidth * self.main.imageData.proportions);
          self.main.imageData.height  = (self.main.imageData.originalHeight * self.main.imageData.proportions)
          
          // Obliczamy nowe wymiary obrazka względem obliczonych procentów
          var newSizes = self.fixSizes(
            self.main.imageData.originalWidth * self.main.imageData.proportions,
            self.main.imageData.originalHeight * self.main.imageData.proportions
          );
          
          // Zmieniamy rozmiar zdjęcia
          self.main.image.css({
            'width':newSizes.width,
            'height':newSizes.height,
            'max-width':newSizes.width,
            'max-height':newSizes.height,
            'min-width':newSizes.width,
            'min-height':newSizes.height
          });

          self.main.CroppingResult.update(undefined, undefined, self.main.options.resultWidth * parseFloat(self.main.CroppingResult.cropPercent), self.main.options.resultHeight * parseFloat(self.main.CroppingResult.cropPercent), true);
        };

        // Szerokość kontenera
        this.main.container.find('.ci-fixing-size.ci-fsw').click(function() {
          self.main.imageData.proportions = self.main.imageContainer.width() / self.main.imageData.originalWidth;
          update();
        });
        
        // Wysokość kontenera
        this.main.container.find('.ci-fixing-size.ci-fsh').click(function() {
          self.main.imageData.proportions = self.main.imageContainer.height() / self.main.imageData.originalHeight;
          update();
        });
      },

      this.fixSizes = function(width, height) {
        /**
         * Jeśli z jakiegoś powodu któraś z wartości jest równa zero, to
         * ustawiamy domyślne wymiary zdjęcia.
         */
        if(width == 0 || height == 0)
        {
          width   = this.main.imageData.width;
          height  = this.main.imageData.height;
        }
        
        var containerSizes = {
          'width':this.main.options.resultWidth,
          'height':this.main.options.resultHeight
        };
        
        if(this.main.options.restrictedBounds)
        {
          if(containerSizes.width > width || containerSizes.height > height)
          {
            var propsWidth  = containerSizes.width / width;
            var propsHeight = containerSizes.height / height;
            
            var smaller = 0;
            
            if(propsWidth > propsHeight)
              smaller = propsWidth;
            else
              smaller = propsHeight;
            
            width = width * smaller;
            height = height * smaller;
            
            this.main.Zooming.eventMouseUp();
          }
        }
        
        return {'width':width+'px','height':height+'px'};
      }
    };


    /**
     * Obiekt odpowiedzialny jest za wrzucanie danych na temat pozycji zdjęcia
     * w kontenerze oraz jego wymiarów do inputów przechowujących te dane.
     */
    var CI_CROPPING_RESULT = function(main) {
      this.main = main;

      /**
       * Współrzędne punktu zaczepienia zaznaczenia obrazka.
       */
      this.coordinates = { 'x' : 0, 'y' : 0 };

      /**
       * Wartość w procentach zaznaczenia obrazka. Domyślnie: 1 == 100%
       */             
      this.cropPercent = 1;

      /**
       * Zapisuje podane dane do inputów o ID typu z doklejonym prefiksem. Jeśli
       * podana wartość jest undefined lub niepodana to pobieramy wartość
       * aktualną danego inputa i ją wrzucamy. W innym wypadku wrzucamy wartość
       * zero.
       * 
       * @param integer x Współrzędna X
       * @param integer y Współrzędna Y
       * @param integer w Szerokość zaznaczenia obrazka
       * @param integer h Wysokość  zaznaczenia obrazka
       * 
       * @return void
       */
      this.update = function(x, y, w, h, triggerEvent) {
        var prop  = this.main.imageData.originalWidth / this.main.imageData.width;
        
        var valueX = this.main.vars.x;
        
        if(x != undefined)      valueX = Math.ceil(prop * x);
        else if(valueX == '')   valueX = 0;
        
        x = valueX;
        $('#'+this.main.options.inputPrefix+'x').val(valueX);
        this.main.vars.x = valueX;
        
        
        var valueY = this.main.vars.y;
        
        if(y != undefined)      valueY = Math.ceil(prop * y);
        else if(valueY == '')   valueY = 0;
        
        y = valueY;
        $('#'+this.main.options.inputPrefix+'y').val(valueY);
        this.main.vars.y = valueY;
        
        
        var valueW = this.main.vars.w;
        
        if(w != undefined)      valueW = Math.ceil(prop * w)
        else if(valueW == '')   valueW = 0;
        
        w = valueW;
        $('#'+this.main.options.inputPrefix+'w').val(valueW);
        this.main.vars.w = valueW;
        
        
        var valueH = this.main.vars.h;
        
        if(h != undefined)      valueH = Math.ceil(prop * h)
        else if(valueH == '')   valueH = 0;
        
        h = valueH;
        $('#'+this.main.options.inputPrefix+'h').val(valueH);
        this.main.vars.h = valueH;

        if(triggerEvent === true)
        {
          this.main.options.onChange(this.main.vars.x, this.main.vars.y, this.main.vars.w, this.main.vars.h, this.main.image);
        }
      }
    };

    /**
     * Resetuje obiekt pluginu i zostawia sam obrazek usuwając kod HTML.
     */
    var CI_RESET = function(main) {
      this.main = main;

      this.reset = function() {
        var img = this.main.image.clone().removeAttr('style');

        this.main.container.replaceWith(img);

        img.data('cropimg', null);
      };
    }

    
    return this.each(function() {
      var Main = new CI_Main($(this), options);
      Main.ToolDrawer = new CI_TOOLDRAWER(Main);
      Main.BtnTips = new CI_BTNSTIPS(Main);
      Main.Movable = new CI_MOVABLE(Main);
      Main.Zooming = new CI_ZOOMING(Main);
      Main.CroppingResult = new CI_CROPPING_RESULT(Main);
      Main.Reset = new CI_RESET(Main);

      Main.ToolDrawer.draw();
      Main.BtnTips.init();
      Main.Movable.init();
      Main.Zooming.init();

      $(this).data('cropimg', Main.Reset);
      
      $(window).trigger('resize');
      
      options.onInit();
    });
  }
})(jQuery);
