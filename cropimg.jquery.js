/**
 * Available for use under the [MIT License](http://en.wikipedia.org/wiki/MIT_License)
 * 
 * Copyright (c) 2013 by Adam Banaszkiewicz, adambanaszkiewicz.pl
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
 * @version 0.1.0
 * @date    2014.05.18
 * @author  Adam Banaszkiewicz adambanaszkiewicz.pl
 */
/**
 * TODO:
 *   - Reset obrazka w kontenerze
 *   - Przycisk "Anuluj kadrowanie" pojawiający się tylko gdy user przesunie obrazek lub zmieni jego zoom.
 */
(function($){
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
      onChange: function(w, h, x, y) {}
      /**
       * @TODO
       
      restrictedBounds: false*/
    }, options);
    
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
    
    document.CI_ALREADY_CHANGED = false;
    
    /**
     * Obiekt jQuery z obrazkiem.
     * 
     * @var jQuery
     */
    document.CI_IMAGE = null;
    
    /**
     * Obiekt z danymi na temat obrazka.
     * 
     * @var jQuery
     */
    document.CI_IMAGE_DATA = {};
    
    /**
     * Obiekt jQuery z głównym kontenerem w którym znajduje się cały plugin.
     * 
     * @var jQuery
     */
    document.CI_MAIN_CONTAINER = null;
    
    /**
     * Obiekt jQuery z kontenerem obrazka.
     * 
     * @var jQuery
     */
    document.CI_IMAGE_CONTAINER = null;
    
    /**
     * Obiekt z danymi na temat kontenera obrazka.
     * 
     * @var jQuery
     */
    document.CI_IMAGE_CONTAINER_DATA = {width: -1};
    
    /**
     * Przechowuje czas w mikrosekundach wywołania pluginu. Potrzebne do
     * nadawania ID elementom.
     * 
     * @var integer
     */
    document.CI_MT = (new Date()).getTime();
    
    /**
     * Obiekt z metodami do rysowania narzędzi pluginu.
     */
    document.CI_TOOLDRAWER = {
      /**
       * Domyślna metoda obiektu.
       */
      draw: function() {
        document.CI_TOOLDRAWER.drawContainers();
        
        document.CI_TOOLDRAWER.drawZoomingButtons();
        
        document.CI_TOOLDRAWER.drawFixingPositionButtons();
        
        document.CI_TOOLDRAWER.drawFixingSizeButtons();
        
        $(window).resize(document.CI_TOOLDRAWER.onResize);
      },
      /**
       * Rysuje kontenery (DIV) i te ważniejsze przypisuje do zmiennych.
       * 
       * @return void
       */
      drawContainers: function() {
        // Tworzymy główny kontener na aplikację
        document.CI_IMAGE.wrap($('<div />', {'class':'ci-main','id':'ci-main-'+document.CI_MT,'style':'max-width:'+options.resultWidth+'px'}));
        document.CI_MAIN_CONTAINER = $('.ci-main#ci-main-'+document.CI_MT);
        
        // Tworzymy kontener bezpośrednio na zdjęcie
        document.CI_IMAGE.wrap($('<div />', {'class':'ci-image-wrapper','id':'ci-image-wrapper-'+document.CI_MT,'style':'max-width:'+options.resultWidth+'px;height:'+options.resultHeight+'px'}));
        document.CI_IMAGE_CONTAINER = $('.ci-image-wrapper#ci-image-wrapper-'+document.CI_MT);
        
        // Kontener na "przybliż - oddal"
        document.CI_MAIN_CONTAINER.append($('<div />', {'class':'ci-tool ci-zooming'}));
      },
      /**
       * Tworzy buttony "przybliż - oddal".
       * 
       * @return void
       */ 
      drawZoomingButtons: function() {
        document.CI_MAIN_CONTAINER.find('.ci-tool.ci-zooming')
          .append($('<div />', {'class':'ci-button ci-tool-zoomin'}))
          .append($('<div />', {'class':'ci-button ci-tool-zoomout'}));
      },
      /**
       * Rysuje buttony przesuwania zdjęcia do krawędzi i rogów kontenera.
       * 
       * @return void
       */
      drawFixingPositionButtons: function() {
        document.CI_IMAGE_CONTAINER
          .append($('<div />', {'class':'ci-fixing-position ci-fptl'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fptc'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fptr'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fpcl'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fpcc'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fpcr'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fpbl'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fpbc'}))
          .append($('<div />', {'class':'ci-fixing-position ci-fpbr'}));
      },
      /**
       * Rysuje buttony zmiany rozmiarów zdjęcia względem kontenera.
       * 
       * @return void
       */
      drawFixingSizeButtons: function() {
        document.CI_IMAGE_CONTAINER
          .append($('<div />', {'class':'ci-fixing-size ci-fsw'}))
          .append($('<div />', {'class':'ci-fixing-size ci-fsh'}));
      },
      onResize: function(e) {
        /**
         * Jeśli szerokość kontenera zdjęcia jest mniejsza niż szerokość
         * domyślna zaznaczenia to zmniejszamy wysokość proporcjonalnie
         * do zmniejszonej szerokości by zachować proporcje.
         */
        if(document.CI_IMAGE_CONTAINER.width() < options.resultWidth)
        {
          document.CI_IMAGE_CONTAINER_DATA.proportionsToOriginal  = document.CI_IMAGE_CONTAINER.width() / options.resultWidth;
          document.CI_IMAGE_CONTAINER.css('height', (options.resultHeight * document.CI_IMAGE_CONTAINER_DATA.proportionsToOriginal)+'px');
          
          // Uaktualniamy dane na temat kontenera obrazka
          document.CI_IMAGE_CONTAINER_DATA.width   = document.CI_IMAGE_CONTAINER.width();
          document.CI_IMAGE_CONTAINER_DATA.height  = document.CI_IMAGE_CONTAINER.height();
          
          // Uaktualniamy dane na temat zaznaczonego obszaru zdjęcia
          document.CI_CROPPING_RESULT.cropPercent = document.CI_IMAGE_CONTAINER_DATA.proportionsToOriginal;
        }
        /**
         * W każdym innym wypadku ustawiamy wysokość kontenera na domyślną
         * wysokość kadrowanego obrazu oraz ustawiamy proporcje kontenera
         * na 1 - czyli nieprzeskalowane (oryginał).
         */
        else
        {
          document.CI_IMAGE_CONTAINER.css('height', options.resultHeight);
          
          // Uaktualniamy dane na temat kontenera obrazka
          document.CI_IMAGE_CONTAINER_DATA.width   = document.CI_IMAGE_CONTAINER.width();
          document.CI_IMAGE_CONTAINER_DATA.height  = options.resultHeight;
          document.CI_IMAGE_CONTAINER_DATA.proportionsToOriginal = 1;
        }
        
        // Odświeżamy wartości
        if(document.CI_ALREADY_CHANGED)
          document.CI_ZOOMING.eventMouseUp();
        
        $('span#window-width').html(document.getWindowWidth());
      }
    };
    
    document.CI_MOVABLE = {
      /**
       * Przechowuje obiekt z wartościami pozycji myszki na której był kursor,
       * podczas rozpoczęcia przesuwania obrazka.
       *  
       * @var object
       */
      mousePositionStart: {
        x:0,
        y:0
      },
      imagePosition: {
        'left':0,
        'top':0
      },
      /**
       * Metoda inicjująca.
       */
      init: function() {
        /**
         * Po kliknięciu na kontener obrazka rozpoczynamy przesuwanie zdjęcia.
         */
        document.CI_IMAGE_CONTAINER.bind('mousedown', document.CI_MOVABLE.eventMouseDown);
        
        /**
         * Dzięki temu, po kliknięciu na obrazek i próbie "przeniesienia go"
         * nie wykona się domyślna reakcja przeglądarki.
         */
        var _sp = function(e) {
          e.preventDefault();
        };
        
        document.CI_IMAGE_CONTAINER.find('img')
          .bind('mousemove', _sp)
          .bind('mouseup', _sp)
          .bind('mousedown', _sp);
        
        document.CI_MOVABLE.bindFixingButtons();
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
      eventMouseDown: function(e) {
        // Zapisujemy pozycję myszki
        document.CI_MOVABLE.mousePositionStart.x = e.pageX;
        document.CI_MOVABLE.mousePositionStart.y = e.pageY;
        
        // Potrzebujemy te dane o obrazku by móc dobrze go przesunąć z tych wartości początkowych
        document.CI_MOVABLE.imagePosition.left = parseInt(document.CI_IMAGE.css('left').replace('px', ''));
        document.CI_MOVABLE.imagePosition.top  = parseInt(document.CI_IMAGE.css('top').replace('px', ''));
        
        document.CI_ALREADY_CHANGED = true;
        
        $('body')
          /**
           * Podczas jeżdżenia po BODY przesuwamy obrazek względem pozycji myszki.
           */
          .bind('mousemove', document.CI_MOVABLE.eventMouseMove)
          /**
           * Po puszczeniu przycisku myszki kończymy przesuwanie.
           */
          .bind('mouseup', document.CI_MOVABLE.eventMouseUp);
      },
      /**
       * Metoda eventu onmouseup. Zdejmuje zdarzenia przenosin z BODY.
       * 
       * @event onmouseup
       * @return void
       */
      eventMouseUp: function() {
        $('body')
          .unbind('mousemove',  document.CI_MOVABLE.eventMouseMove)
          .unbind('mouseup',    document.CI_MOVABLE.eventMouseUp);
        
        /**
         * Uaktualniamy pozycję obrazka. Robimy to tutaj a nie w funkcji
         * przesuwania ponieważ tam zabierałaby niepotrzebnie moc obliczeniową
         * przeglądarki wrzucając co jeden piksel dane do inputów a tak
         * oblicza pozycję tylko raz i tylko raz wrzuca ją do inputów.
         */
        document.CI_CROPPING_RESULT.update(parseInt(document.CI_IMAGE.css('left').replace('px', '')), parseInt(document.CI_IMAGE.css('top').replace('px', '')));
        
        /**
         * Może zdarzyć się tak, że użytkownik tylko kliknie w przeniesienie
         * obrazka do którejś z krawędzi. W ten sposób (jeśli nie ma) dodadzą
         * się pozycje X i Y obrazka lub uaktualnią, ale nic nie stanie się
         * z wartościami W i H obrazka - więc jeśli ich tam nie było, to po
         * uaktualnieniu ich nadal nie będzie (lub będzie 0 i 0), dla tego
         * musimy tutaj sztucznie wymusić ustawienie wartości W i H obrazka.
         */
        document.CI_ZOOMING.eventMouseUp();
      },
      /**
       * Metoda eventu onmousemove. Za pomocą metody pomocniczej oblicza
       * pozycję obrazka i przesuwa go.
       * 
       * @event onmousemove
       * @param object e
       * @return void
       */
      eventMouseMove: function(e) {
        document.CI_ALREADY_CHANGED = true;
        
        // Obliczamy nowe pozycje i przesuwamy obrazek.
        document.CI_IMAGE.css(document.CI_MOVABLE.helper.calculatePosition(e.pageX, e.pageY));
      },
      /**
       * Podpina funkcje pod przyciski w kontenerze zdjęcia odpowiedzialne
       * za przesunięcie zdjęcia do danej krawędzi lub rogu kontenera.
       * 
       * @return void
       */
      bindFixingButtons: function() {
        // Top left
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fptl').mouseup(function() {
          document.CI_IMAGE.css({'top':'0px','left':'0px'});
          document.CI_CROPPING_RESULT.update(0, 0);
        });
        
        // Top center
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fptc').mouseup(function() {
          var left = -((document.CI_IMAGE_DATA.width / 2) - (document.CI_IMAGE_CONTAINER_DATA.width / 2));
          document.CI_IMAGE.css({'top':'0px','left':left+'px'});
          document.CI_CROPPING_RESULT.update(left, 0);
        });
        
        // Top right
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fptr').mouseup(function() {
          var left = -(document.CI_IMAGE_DATA.width - document.CI_IMAGE_CONTAINER_DATA.width);
          document.CI_IMAGE.css({'top':'0px','left':left+'px'});
          document.CI_CROPPING_RESULT.update(left, 0);
        });
        
        // Center left
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fpcl').mouseup(function() {
          var top = -((document.CI_IMAGE_DATA.height / 2) - (document.CI_IMAGE_CONTAINER_DATA.height / 2));
          document.CI_IMAGE.css({'top':top+'px','left':'0px'});
          document.CI_CROPPING_RESULT.update(0, top);
        });
        
        // Center center
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fpcc').mouseup(function() {
          var top   = -((document.CI_IMAGE_DATA.height / 2) - (document.CI_IMAGE_CONTAINER_DATA.height / 2));
          var left  = -((document.CI_IMAGE_DATA.width / 2) - (document.CI_IMAGE_CONTAINER_DATA.width / 2));
          document.CI_IMAGE.css({'top':top+'px','left':left+'px'});
          document.CI_CROPPING_RESULT.update(left, top);
        });
        
        // Center right
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fpcr').mouseup(function() {
          var top   = -((document.CI_IMAGE_DATA.height / 2) - (document.CI_IMAGE_CONTAINER_DATA.height / 2));
          var left  = -(document.CI_IMAGE_DATA.width - document.CI_IMAGE_CONTAINER_DATA.width);
          document.CI_IMAGE.css({'top':top+'px','left':left+'px'});
          document.CI_CROPPING_RESULT.update(left, top);
        });
        
        // Bottom left
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fpbl').mouseup(function() {
          var top = -(document.CI_IMAGE_DATA.height - document.CI_IMAGE_CONTAINER_DATA.height);
          document.CI_IMAGE.css({'top':top+'px','left':'0px'});
          document.CI_CROPPING_RESULT.update(0, top);
        });
        
        // Bottom center
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fpbc').mouseup(function() {
          var top   = -(document.CI_IMAGE_DATA.height - document.CI_IMAGE_CONTAINER_DATA.height);
          var left  = -((document.CI_IMAGE_DATA.width / 2) - (document.CI_IMAGE_CONTAINER_DATA.width / 2));
          document.CI_IMAGE.css({'top':top+'px','left':left+'px'});
          document.CI_CROPPING_RESULT.update(left, top);
        });
        
        // Bottom right
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-position.ci-fpbr').mouseup(function() {
          var top   = -(document.CI_IMAGE_DATA.height - document.CI_IMAGE_CONTAINER_DATA.height);
          var left  = -(document.CI_IMAGE_DATA.width - document.CI_IMAGE_CONTAINER_DATA.width);
          document.CI_IMAGE.css({'top':top+'px','left':left+'px'});
          document.CI_CROPPING_RESULT.update(left, top);
        });
      },
      /**
       * Metody pomocnicze.
       * 
       * @var object
       */
      helper: {
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
        calculatePosition: function(pageX, pageY) {
          /*if(options.restrictedBounds)
          {
            return document.CI_MOVABLE.helper.fixPosition(
              pageY - document.CI_MOVABLE.mousePositionStart.y + sizes.top,
              pageX - document.CI_MOVABLE.mousePositionStart.x + sizes.left
            );
          }
          else
          { */
            return {'top':pageY - document.CI_MOVABLE.mousePositionStart.y + document.CI_MOVABLE.imagePosition.top,'left':pageX - document.CI_MOVABLE.mousePositionStart.x + document.CI_MOVABLE.imagePosition.left};
          //}
        },
        // Tymczasowe!
        /*
        fixPosition: function(top, left) {
          if(top < -(document.CI_IMAGE.height() - options.resultHeight))
            top = -(document.CI_IMAGE.height() - options.resultHeight);
          
          if(left < -(document.CI_IMAGE.width() - options.resultWidth))
            left = -(document.CI_IMAGE.width() - options.resultWidth);
            
          if(top > 0)
            top = 0;
          
          if(left > 0)
            left = 0;
          
          return {'top':top,'left':left};
        },
        recalculatePositionInContainer: function() {
          var elementsSizes = {
            'cw':options.resultWidth,
            'ch':options.resultHeight,
            'it':parseInt(document.CI_IMAGE.css('top').replace('px', '')),
            'il':parseInt(document.CI_IMAGE.css('left').replace('px', '')),
            'iw':document.CI_IMAGE.width(),
            'ih':document.CI_IMAGE.height()
          };
          
          // TODO
          // Jeśli obrazek zaczyna wychodzić z prawej krawędzi kontenera (nie mieści się)
          //if(
        }*/
      }
    };
    
    /**
     * Obiekt odpowiedzialny za "przybliż - oddal".
     */
    document.CI_ZOOMING = {
      /**
       * Przechowuje obiekt interwału zoomowania.
       * 
       * @var object
       */
      interval:null,
      /**
       * Czas, który pozostał, do rozpoczęcia zoomu w petli.
       * 
       * @var integer
       */
      timesLeftToZoom: options.zoomDelay,
      /**
       * Przechowuje informacje na temat tego, czy można zastopować
       * zoomowanie podczas zdarzenia mouseup na body.
       * 
       * @var boolean
       */
      canStopZoom: false,
      /**
       * Przechowuje funkcję callable z wywołaniem funkcji zoom z parametrem
       * określającym czy ma przybliżać czy oddalać.
       * 
       * @var function
       */
      zoomFunction: function() {},
      /**
       * Inicjator.
       */   
      init: function() {
        // Podpinamy zoom dla przycisków
        document.CI_MAIN_CONTAINER
          .find('.ci-tool.ci-zooming .ci-button')
          .mousedown(function() {
            document.CI_ZOOMING.canStopZoom = true;
            document.CI_ZOOMING.eventMouseDown($(this).hasClass('ci-tool-zoomin') ? 'in' : 'out');
          })
          .mouseup(function(e) {
            document.CI_ZOOMING.eventMouseUp();
            document.CI_ZOOMING.canStopZoom = false;
            e.stopPropagation();
          });
        
        // Reset zoom
        $('body').mouseup(function() {
          if(document.CI_ZOOMING.canStopZoom)
            document.CI_ZOOMING.stopZoom();
        });
        
        // Dane obrazka
        document.CI_IMAGE_DATA = {
          // Oryginalne wymiary obrazka
          originalWidth: document.CI_IMAGE.width(),
          originalHeight: document.CI_IMAGE.height(),
          // Aktualne wymiary obrazka
          width: document.CI_IMAGE.width(),
          height: document.CI_IMAGE.height(),
          // Poporcje wymiarów obrazka względem oryginalnych
          proportions: 1
        };
        
        document.CI_ZOOMING.bindFixingButtons();
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
      eventMouseDown: function(type) {
        document.CI_ALREADY_CHANGED = true;
        // Ustawiamy, że w interwale może być wykonywana funkcja zoomowania
        document.CI_ZOOMING.allowedZoomingFromInterval = true;
        
        // Ustawiamy funkcję wywołującą funkcję zoomowania w zależności od typu
        document.CI_ZOOMING.zoomFunction = function() {document.CI_ZOOMING.zoom(type);};
        
        document.CI_ZOOMING.interval = setInterval(function() {
          document.CI_ZOOMING.timesLeftToZoom = document.CI_ZOOMING.timesLeftToZoom - 10;
          
          if(document.CI_ZOOMING.timesLeftToZoom <= 0)
            document.CI_ZOOMING.zoomFunction();
        }, 10);
        
        return false;
      },
      /**
       * Zatrzymanie zmiany rozmiaru.
       * 
       * @return void
       */
      eventMouseUp: function() {
        // Wykonujemy jeden raz funkcję zoomowania
        document.CI_ZOOMING.zoomFunction();
        
        document.CI_CROPPING_RESULT.update(undefined, undefined, options.resultWidth * parseFloat(document.CI_CROPPING_RESULT.cropPercent), options.resultHeight * parseFloat(document.CI_CROPPING_RESULT.cropPercent));
        
        document.CI_ZOOMING.stopZoom();
      },
      /**
       * Metoda resetuje i stopuje ZOOM.
       * 
       * @return void
       */
      stopZoom: function() {
        document.CI_ZOOMING.timesLeftToZoom = options.zoomDelay;
        
        clearInterval(document.CI_ZOOMING.interval);
      },
      /**
       * Główna metoda odpowiedzialna za zoomowanie obrazka. Parametr type='in' oznacza
       * przybliżenie, parametr type='out' oznacza oddalenie.
       * 
       * @param string type 'in' lub 'out'
       * @return void
       */
      zoom: function(type) {
        // Zmieniamy wielkość procent w zależności od tego, czy przybliżamy czy oddalamy
        if(type == 'in')
          document.CI_IMAGE_DATA.proportions = (parseFloat(document.CI_IMAGE_DATA.proportions) + 0.001).toFixed(3);
        else
          document.CI_IMAGE_DATA.proportions = (parseFloat(document.CI_IMAGE_DATA.proportions) - 0.001).toFixed(3);
        
        // Maksymalne przybliżenie to 200%
        if(document.CI_IMAGE_DATA.proportions >= 2)
          document.CI_IMAGE_DATA.proportions = 2;
        
        // Maksymalne oddalenie to 1%
        if(document.CI_IMAGE_DATA.proportions <= 0.001)
          document.CI_IMAGE_DATA.proportions = 0.001;
        
        
        document.CI_IMAGE_DATA.width   = (document.CI_IMAGE_DATA.originalWidth * document.CI_IMAGE_DATA.proportions);
        document.CI_IMAGE_DATA.height  = (document.CI_IMAGE_DATA.originalHeight * document.CI_IMAGE_DATA.proportions)
        
        // Obliczamy nowe wymiary obrazka względem obliczonych procentów
        var newSizes = document.CI_ZOOMING.helper.fixSizes(
          document.CI_IMAGE_DATA.originalWidth * document.CI_IMAGE_DATA.proportions,
          document.CI_IMAGE_DATA.originalHeight * document.CI_IMAGE_DATA.proportions
        );
        
        // Zmieniamy rozmiar zdjęcia
        document.CI_IMAGE.css({
          'width':newSizes.width,
          'height':newSizes.height,
          'max-width':newSizes.width,
          'max-height':newSizes.height,
          'min-width':newSizes.width,
          'min-height':newSizes.height
        });
        
        $('span.else').html(newSizes.width+' - '+document.CI_IMAGE_DATA.proportions+'%');
      },
      /**
       * Podpina funkcje pod przyciski w kontenerze zdjęcia odpowiedzialne
       * za zmianę rozmiaru zdjęcia względem rozmiaru kontenera.
       * 
       * @return void
       */
      bindFixingButtons: function() {
        // Szerokość kontenera
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-size.ci-fsw').click(function() {
          var proportions = document.CI_IMAGE_CONTAINER.width() / document.CI_IMAGE_DATA.originalWidth;
          var height      = Math.ceil(document.CI_IMAGE_DATA.originalHeight * proportions);
          
          document.CI_IMAGE.css({
            'min-width' :document.CI_IMAGE_CONTAINER.width()+'px',
            'max-width' :document.CI_IMAGE_CONTAINER.width()+'px',
            'width'     :document.CI_IMAGE_CONTAINER.width()+'px',
            'min-height':height+'px',
            'max-height':height+'px',
            'height'    :height+'px'
          });
          
          document.CI_IMAGE_DATA.width        = document.CI_IMAGE_CONTAINER.width();
          document.CI_IMAGE_DATA.height       = height;
          document.CI_IMAGE_DATA.proportions  = proportions;          
          
          document.CI_CROPPING_RESULT.update(undefined, undefined, document.CI_IMAGE_CONTAINER.width(), height);
        });
        
        // Wysokość kontenera
        document.CI_IMAGE_CONTAINER.find('.ci-fixing-size.ci-fsh').click(function() {
          var proportions = document.CI_IMAGE_CONTAINER.height() / document.CI_IMAGE_DATA.originalHeight;
          var width       = Math.ceil(document.CI_IMAGE_DATA.originalWidth * proportions);
          
          document.CI_IMAGE.css({
            'min-height':document.CI_IMAGE_CONTAINER.height()+'px',
            'max-height':document.CI_IMAGE_CONTAINER.height()+'px',
            'height'    :document.CI_IMAGE_CONTAINER.height()+'px',
            'min-width' :width+'px',
            'max-width' :width+'px',
            'width'     :width+'px'
          });
          document.CI_IMAGE_DATA.width   = width;
          document.CI_IMAGE_DATA.height  = document.CI_IMAGE_CONTAINER.height();
          document.CI_IMAGE_DATA.proportions = proportions;          
          
          document.CI_CROPPING_RESULT.update(undefined, undefined, width, document.CI_IMAGE_CONTAINER.height());
        });
      },
      helper: {
        fixSizes: function(width, height) {
          /**
           * Jeśli z jakiegoś powodu któraś z wartości jest równa zero, to
           * ustawiamy domyślne wymiary zdjęcia.
           */
          if(width == 0 || height == 0)
          {
            width   = document.CI_IMAGE_DATA.width;
            height  = document.CI_IMAGE_DATA.height;
          }
          
          var containerSizes = {
            'width':options.resultWidth,
            'height':options.resultHeight
          };
          
          if(options.restrictedBounds)
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
              
              document.CI_ZOOMING.eventMouseUp();
            }
          }
          
          return {'width':width+'px','height':height+'px'};
        }
      }
    };
    
    /**
     * Obiekt odpowiedzialny jest za wrzucanie danych na temat pozycji zdjęcia
     * w kontenerze oraz jego wymiarów do inputów przechowujących te dane.
     */
    document.CI_CROPPING_RESULT = {
      /**
       * Przechowuje wartość proporcji domyślnych wymiarów rezultatu kadrowania
       * do wymiarów po zmniejszeniu kontenera. Jeśli kontener ma wymiary większe
       * niż strona, to zmniejszana jest jego wysokość proporcjonalnie oraz
       * wyliczana jest proporcja zmniejszenia. Później z tej proporcji
       * obliczany jest faktyczny rozmiar zaznaczonego kawałka zdjęcia.
       * 
       * @var integer
       
      containerProportions: 1,*/
      /**
       * Współrzędne punktu zaczepienia zaznaczenia obrazka.
       */
      coordinates: { 'x' : 0, 'y' : 0 },
      /**
       * Wartość w procentach zmiany rozmiaru obrazka z jego oryginalnych
       * wartości. Domyślnie: 1 == 100%
       */    
      //imageZoomPercent: 1,
      /**
       * Wartość w procentach zaznaczenia obrazka. Domyślnie: 1 == 100%
       */             
      cropPercent: 1,
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
      update: function(x, y, w, h) {
        var value = '';
        var prop  = document.CI_IMAGE_DATA.originalWidth / document.CI_IMAGE_DATA.width;
        
        value = $('#'+options.inputPrefix+'x').val();
        
        if(x != undefined)    value = Math.ceil(prop * x);
        else if(value == '')  value = 0;
        
        x = value;
        $('#'+options.inputPrefix+'x').val(value);
        
        
        value = $('#'+options.inputPrefix+'y').val();
        
        if(y != undefined)    value = Math.ceil(prop * y);
        else if(value == '')  value = 0;
        
        y = value;
        $('#'+options.inputPrefix+'y').val(value);
        
        
        value = $('#'+options.inputPrefix+'w').val();
        
        if(w != undefined)    value = Math.ceil(prop * w)
        else if(value == '')  value = 0;
        
        w = value;
        $('#'+options.inputPrefix+'w').val(value);
        
        
        value = $('#'+options.inputPrefix+'h').val();
        
        if(h != undefined)    value = Math.ceil(prop * h)
        else if(value == '')  value = 0;
        
        h = value;
        $('#'+options.inputPrefix+'h').val(value);
        
        options.onChange(x, y, w, h);
      }
    };
    
    return this.each(function() {
      // Obiekt obrazka
      document.CI_IMAGE = $(this);
      
      // Rysujemy narzędzia
      document.CI_TOOLDRAWER.draw();
      
      // Inicjujemy przesuwanie obrazka
      document.CI_MOVABLE.init();
      
      // Inicjujemy zoomowanie
      document.CI_ZOOMING.init();
      
      $(window).trigger('resize');
      
      options.onInit();
    });
  }
})(jQuery);