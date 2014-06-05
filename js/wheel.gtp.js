//Modeled code structure after http://starter.pixelgraphics.us/
(function($) {
    $.WHEEL = function(el, onTimerTick, spin, draw, clear, drawSlices, drawSlice, drawCircles, drawPointer, options) {
        // To avoid scope issues, use 'base' instead of 'this'
        // to reference this class from internal events and functions.
        var base = this;

        // Access to jQuery and DOM versions of element
        base.$el = $(el);
        base.el = el;

        // Add a reverse reference to the DOM object
        base.$el.data("WHEEL", base);

        base.init = function() {
            base.onTimerTick = onTimerTick;
            base.spin = spin;
            base.draw = draw;
            base.clear = clear;
            base.drawSlices = drawSlices;
            base.drawSlice = drawSlice;
            base.drawCircles = drawCircles;
            base.drawPointer = drawPointer;

            base.options = $.extend({}, $.WHEEL.defaultOptions, options);

            // Put your initialization code here
            $("html").append("<canvas id='myCanvas' width='" + WHEEL.size + "' height='" + WHEEL.size + "'style='border:1px solid #000000;'></canvas>");
        };
        
        

        // Sample Function, Uncomment to use
         base.functionName = function(paramaters){
        
         };

        // Run initializer
        base.init();
    };
    
    //Formatting for different slices
    var bankruptFormat = function(context) {
            context.lineWidth = 1;
            context.fillStyle = '#FFFFFF';
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "1em Arial";
        };
       
       
    //Options for wheel
    $.WHEEL.defaultOptions = {
        size: 600,
        radius: 290,
        slices: [
            {value: 100, alt: "", color: '#cc0000', formatting: null, callback: null},
            {value: 100, alt: "", color: '#00cc00', formatting: null, callback: null},
            {value: 100, alt: "", color: '#0000cc', formatting: null, callback: null},
            {value: -1, alt: "BANKRUPT", color: '#000000', formatting: bankruptFormat, callback: null},
            {value: 100, alt: "", color: '#cc0000', formatting: null, callback: null},
            {value: 100, alt: "", color: '#00cc00', formatting: null, callback: null},
            {value: 100, alt: "", color: '#0000cc', formatting: null, callback: null},
            {value: -1, alt: "BANKRUPT", color: '#000000', formatting: bankruptFormat, callback: null},
            {value: 100, alt: "", color: '#cc0000', formatting: null, callback: null},
            {value: 100, alt: "", color: '#00cc00', formatting: null, callback: null},
            {value: 100, alt: "", color: '#0000cc', formatting: null, callback: null},
            {value: -1, alt: "BANKRUPT", color: '#000000', formatting: bankruptFormat, callback: null},
            {value: 100, alt: "", color: '#cc0000', formatting: null, callback: null},
            {value: 100, alt: "", color: '#00cc00', formatting: null, callback: null},
            {value: 100, alt: "", color: '#0000cc', formatting: null, callback: null},
            {value: -1, alt: "BANKRUPT", color: '#000000', formatting: bankruptFormat, callback: null},
            {value: 100, alt: "", color: '#cc0000', formatting: null, callback: null},
            {value: 100, alt: "", color: '#00cc00', formatting: null, callback: null},
            {value: 100, alt: "", color: '#0000cc', formatting: null, callback: null},
            {value: -1, alt: "BANKRUPT", color: '#000000', formatting: bankruptFormat, callback: null},
            {value: 100, alt: "", color: '#cc0000', formatting: null, callback: null},
            {value: 100, alt: "", color: '#00cc00', formatting: null, callback: null},
            {value: 100, alt: "", color: '#0000cc', formatting: null, callback: null},
            {value: -1, alt: "BANKRUPT", color: '#000000', formatting: bankruptFormat, callback: null},
            {value: 100, alt: "", color: '#cc0000', formatting: null, callback: null},
            {value: 100, alt: "", color: '#00cc00', formatting: null, callback: null},
            {value: 100, alt: "", color: '#0000cc', formatting: null, callback: null},
            {value: -1, alt: "BANKRUPT", color: '#000000', formatting: bankruptFormat, callback: null}
        ],
        lineHeight: 22,
        innerLineWidth: 1,
        innerCircleFill: '#ffffff',
        innerCircleStroke: '#000000',
        outerLineWidth: 4,
        outerCircleStroke: '#000000',
        rotations: 25.1327412287,
        spinDuration: 600,
        REFRESH_RATE: 15
    };

    $.fn.WHEEL = function(onTimerTick, spin, draw, clear, drawSlices, drawSlice, drawCircles, drawPointer, options) {
        return this.each(function() {
            (new $.WHEEL(this, onTimerTick, spin, draw, clear, drawSlices, drawSlice, drawCircles, drawPointer, options));
        });
    };

})(jQuery);