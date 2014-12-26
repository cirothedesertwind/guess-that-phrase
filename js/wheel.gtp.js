// jQuery Plugin Boilerplate
// A boilerplate for jumpstarting jQuery plugins development
// version 2.0, July 8th, 2011
// by Stefan Gabos

// remember to change every instance of "pluginName" to the name of your plugin!
// the semicolon at the beginning is there on purpose in order to protect the integrity 
// of your scripts when mixed with incomplete objects, arrays, etc.
;
(function($) {

    // we need attach the plugin to jQuery's namespace or otherwise it would not be
    // available outside this function's scope
    // "el" should be a jQuery object or a collection of jQuery objects as returned by
    // jQuery's selector engine
    $.WHEEL = function(canvasCtx, wheelAng, finishCallback, options) {

         var bankruptFormat = function(context) {
            context.lineWidth = 1;
            context.fillStyle = '#FFFFFF';
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "3em Raleway";
        };
        
        var looseTurnFormat = function(context) {
            context.lineWidth = 1;
            context.fillStyle = '#000000';
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "3em Raleway";
        };

        // plugin's default options
        // this is private property and is accessible only from inside the plugin
        var defaults = {
            size: 1200,
            radius: 580,
            slices: [
                {value: 250, alt: "", color: '#2E8B57', formatting: null, callback: null},//00
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//10
                {value: 1000, alt: "", color: '#DAA520', formatting: null, callback: null},//11
                {value: 800, alt: "", color: '#CC0000', formatting: null, callback: null},//12
                {value: 400, alt: "", color: '#9400D3', formatting: null, callback: null},//13
                {value: 250, alt: "", color: '#2E8B57', formatting: null, callback: null},//14
                {value: 350, alt: "", color: '#FFA500', formatting: null, callback: null},//15
                {value: 500, alt: "", color: '#00BFFF', formatting: null, callback: null},//16
                {value: 750, alt: "", color: '#808000', formatting: null, callback: null},//17
                {value: 2500, alt: "", color: '#C0C0C0', formatting: null, callback: null},//18
                {value: 0xFFFFBA, alt: "BANKRUPT", color: '#0A0A0A', formatting: bankruptFormat, callback: null},//19
                {value: 400, alt: "", color: '#9400D3', formatting: null, callback: null},//20
                {value: 250, alt: "", color: '#2E8B57', formatting: null, callback: null},//21
                {value: 300, alt: "", color: '#FF8C00', formatting: null, callback: null},//22
                {value: 500, alt: "", color: '#00BFFF', formatting: null, callback: null},//23
                {value: 650, alt: "", color: '#FA8072', formatting: null, callback: null},//24
                {value: 750, alt: "", color: '#808000', formatting: null, callback: null},//25
                {value: 400, alt: "", color: '#9400D3', formatting: null, callback: null},//26
                {value: 0xFFFF10, alt: "L TURN", color: '#FFFFFF', formatting: looseTurnFormat, callback: null}//27
            ],
            lineHeight: 44,
            innerLineWidth: 2,
            innerCircleFill: '#ffffff',
            innerCircleStroke: '#000000',
            outerLineWidth: 8,
            outerCircleStroke: '#000000',
            rotations: 18.8495559215, //Math.PI * 6
            spinDuration: 800,
            ///////////////////////////////////////////////////////////
            /////////////// INTERNAL VARS /////////////////////////////
            ///////////////////////////////////////////////////////////

            REFRESH_RATE: 15,
            currency: '$',
            // if your plugin is event-driven, you may provide callback capabilities 
            // for its events. call these functions before or after events of your 
            // plugin, so that users may "hook" custom functions to those particular 
            // events without altering the plugin's code
            onSomeEvent: function() {
            }

        }

        ///////////////////////////////////////////////////////////
        ////////// WHEEL VARIABLES ////////////////////////////////
        ///////////////////////////////////////////////////////////

        var canvasContext = null;
        var wheelSpinTimer = null;

        var isSpinning = false;
        var spinDuration = 0;
        var countTime = 0;

        var wheelAngle = 0;
        var spinRandomFactor = 0;
        var currentSlice = -1;
       
        var spinFinishedCallback;

        // to avoid confusions, use "plugin" to reference the
        // current instance of the  object
        var plugin = this;

        // this will hold the merged default, and user-provided options
        // plugin's properties will be accessible like:
        // plugin.settings.propertyName from inside the plugin or
        // myplugin.settings.propertyName from outside the plugin
        // where "myplugin" is an instance of the plugin
        plugin.settings = {}

        // the "constructor" method that gets called when the object is created
        // this is a private method, it can be called only from inside the plugin
        var init = function() {

            // the plugin's final properties are the merged default and 
            // user-provided options (if any)
            plugin.settings = $.extend({}, defaults, options);

            // code goes here

            canvasContext = canvasCtx;
            wheelAngle = wheelAng;
            spinFinishedCallback = finishCallback;

            draw(canvasContext, wheelAngle);

        }

        // public methods
        // these methods can be called like:
        // plugin.methodName(arg1, arg2, ... argn) from inside the plugin or
        // myplugin.publicMethod(arg1, arg2, ... argn) from outside the plugin
        // where "myplugin" is an instance of the plugin

        onTimerTick = function() {
            countTime += plugin.settings.REFRESH_RATE;

            if (countTime >= spinDuration) {
                isSpinning = false;
                wheelSpinTimer.stop();

                //Simplify the wheel angle after each spin
                while (wheelAngle >= Math.PI * 2) {
                    wheelAngle -= Math.PI * 2;
                }
                
                SLICES = plugin.settings.slices.length;
                //ListPlot[{{0,3/4*pi*2},{1/4*pi*2,1/2*pi*2},{1/2*pi*2,1/4*pi*2},{3/4*pi*2,0},{pi*2,1/4*pi*2}}]
                //ListPlot[{{0-1/2*pi,3/4*pi*2},{1/4*pi*2-1/2*pi,1/2*pi*2},{1/2*pi*2-1/2*pi,1/4*pi*2},{3/4*pi*2-1/2*pi,0},{pi*2-1/2*pi,1/4*pi*2}}]
                // angle -= 1/2 * pi
                // then angle = abs(-angle + pi)
                a = wheelAngle;
                a -= 1/2 * Math.PI;
                a = Math.abs(-a + Math.PI);
                slice =  Math.floor((a / (Math.PI * 2))*SLICES);
                //past North it needs to be inverted.
                if (wheelAngle > (0.75*Math.PI*2))
                    slice = SLICES - slice-1;
                        
                currentSlice = slice;
                
                plugin.settings.slices[slice].callback();
            }
            else {
                wheelAngle = easeOutCubic(countTime, 0, 1, spinDuration) *
                        plugin.settings.rotations * spinRandomFactor;
            }

            draw(canvasContext, wheelAngle);
        };

        plugin.spin = function() {

            if (wheelSpinTimer == null) { //Initialize timer first time
                wheelSpinTimer = $.timer(onTimerTick);
                wheelSpinTimer.set({time: plugin.settings.REFRESH_RATE, autostart: false});
            }

            if (!isSpinning) {
                isSpinning = true;
                spinDuration = plugin.settings.spinDuration;
                countTime = 0;

                spinRandomFactor = 0.63 + 0.37 * Math.random();

                wheelSpinTimer.play();


            }
        };
        
        plugin.getValue = function() {
            return plugin.settings.slices[currentSlice].value;
        };
        
        plugin.getColor = function() {
            return plugin.settings.slices[currentSlice].color;
        };

        plugin.setAllCallbacks = function(callback){
            for (var i = 0; i < plugin.settings.slices.length; i++)
                plugin.settings.slices[i].callback = callback;
        };
        
        plugin.setCallback = function(index, callback){
            plugin.settings.slices[index].callback = callback;
        };

        draw = function(context, angleOffset) {
            clear(context);
            drawSlices(context, angleOffset);
            drawCircles(context);
            drawPointer(context);
        };
        clear = function(context) {
            context.clearRect(0, 0, context.width, context.height);
        };
        drawSlices = function(context, angleOffset) {
            context.lineWidth = 1;
            context.strokeStyle = '#000000';
            context.textBaseline = "middle";
            context.textAlign = "center";
            context.font = "3em Raleway";

            sliceAngle = (2 * Math.PI) / plugin.settings.slices.length;

            for (var i = 0; i < plugin.settings.slices.length; i++) {
                drawSlice(context, i, angleOffset + sliceAngle * i, sliceAngle);
            }
        };
        drawSlice = function(context, index, angle, sliceAngle) {
            context.save();
            context.beginPath();

            context.moveTo(plugin.settings.size / 2, plugin.settings.size / 2);
            context.arc(plugin.settings.size / 2, plugin.settings.size / 2, plugin.settings.radius + plugin.settings.outerLineWidth / 2, angle, angle + sliceAngle, false); // Draw a arc around the edge
            context.lineTo(plugin.settings.size / 2, plugin.settings.size / 2);
            context.closePath();

            context.fillStyle = plugin.settings.slices[index].color;
            context.fill();
            context.stroke();

            // Draw the text verticaly
            context.translate(plugin.settings.size / 2, plugin.settings.size / 2);
            context.rotate((angle + angle + sliceAngle) / 2);
            context.translate(0.85 * plugin.settings.radius, 0);
            context.rotate(Math.PI / 2);

            context.fillStyle = '#000000';

            var str = null;
            if (plugin.settings.slices[index].alt.length == 0) {
                str = plugin.settings.currency + plugin.settings.slices[index].value.toString();
            } else {
                str = plugin.settings.slices[index].alt;
            }

            if (plugin.settings.slices[index].formatting != null){   
                plugin.settings.slices[index].formatting(context);
            }

            for (var i = 0; i < str.length; i++) {
                context.fillText(str.charAt(i), 0, plugin.settings.lineHeight * i);
            }

            context.restore();
        };
        drawCircles = function(context) {
            //Draw inner circle to conceal Moire pattern
            context.beginPath();
            context.arc(plugin.settings.size / 2, plugin.settings.size / 2, 20, 0, 2 * Math.PI, false);
            context.closePath();

            context.fillStyle = plugin.settings.innerCircleFill;
            context.strokeStyle = plugin.settings.innerCircleStroke;
            context.fill();
            context.stroke();

            // Draw outer circle to conceal jaggy edges
            // TODO: This circle aliases pretty bad.
            context.beginPath();
            context.arc(plugin.settings.size / 2, plugin.settings.size / 2, plugin.settings.radius, 0, 2 * Math.PI, false);
            context.closePath();

            context.lineWidth = plugin.settings.outerLineWidth;
            context.strokeStyle = plugin.settings.outerCircleStroke;
            context.stroke();
        };
        drawPointer = function(context) {

            context.lineWidth = 2;
            context.strokeStyle = '#000000';
            context.fileStyle = '#ffffff';

            context.beginPath();

            context.moveTo(plugin.settings.size / 2, 40);
            context.lineTo(plugin.settings.size / 2 - 10, 0);
            context.lineTo(plugin.settings.size / 2 + 10, 0);
            context.closePath();

            context.stroke();
            context.fill();
        };


        // private methods
        // these methods can be called only from inside the plugin like:
        // methodName(arg1, arg2, ... argn)
        var easeOutCubic = function(t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        };

        // call the "constructor" method
        init();

    };
            
})(jQuery);