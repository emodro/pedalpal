const switchMap = {
	a1:[21,1],
	a2:[21,2],
	a3:[21,3],
	b1:[22,1],
	b2:[22,2],
	b3:[22,3],
	c1:[23,1],
	c2:[23,2],
	c3:[23,3],
	left:[103,86],
	both:[103,127],
	right:[103,45],
	bypass:[102,0],

}
const sliderMap={
	topLeftKnob:14,
	topMiddleKnob:15,
	topRightKnob:16,
	bottomLeftKnob:17,
	bottomMiddleKnob:18,
	bottomRightKnob:19,
	blooperRecord:1,
	blooperPlay:2,
	
	blooperDub:3,
	blooperStop:4,
	blooperUndo:5,

	blooperRedo:6,
	blooperErase:7,
	blooperHold:8,

	modA:30,
	modB:31,
	ramp:20
}
let outputDevice = null;
let midiChannel="all"
let outputs = []

let aButton=0;
let bButton=0;
let cButton=0;
let dButton=0;

let blooperButtonValues = {
	blooperUndo:0,
	blooperRedo:0,
	blooperErase:0,
	blooperHold:0,
	blooperRecord:0,
	blooperStop:0,
	blooperDub:0,
	blooperPlay:0,
	blooperHold:0,
	modA:0,
	modB:0,
	ramp:0
}

$(document).ready(function() {
	
	WebMidi.enable(function() { 

		outputs =WebMidi.outputs;
		$(function(){
			var $select = $(".midiSelect");
			if (outputs.length ==0){
				$select.append($('<option></option>').val("No device found").html("No device found"))
			}else{
				outputs.forEach(element => {
					$select.append($('<option></option>').val(element.name).html(element.name))
				})
			}
		})

    // Getting the current topLeftKnob
    console.log(WebMidi.time);


    outputDevice = WebMidi.getOutputByName("UM-ONE");


    if (outputDevice){
    	$('#status').html("Status: UM-ONE Enabled")
    } else{
    	$('#status').html("Status: Disconnected")
    }

    // Playing a note (note number 60 on the 1st channel [0] at half velocity)
    
    // Send control change value 127 to controller 1 (modulation) on channel 0
    // output.sendControlChange(103, 127, "all");
    // output.sendControlChange(103, 0, "all", 3000);     // wait 1 sec. before sending

    // Send channel aftertouch


},

function(m) {
	console.log("Could not enable MIDI interface: " + m);
	$('#status').html("Could not enable MIDI interface: " + m)
},

  true      // Whether to enable sysex or not. When set to 'true', it might trigger an
            // authorization prompt to the user. If you do not need it, leave it to false.

            );
	$('.switch').change(function(e) {
		e.stopImmediatePropagation();
		let id = $(this).attr('id');
		processSwitch(id,$(this).is(":checked")); 

	});
	$('.input-knob').on('input', function(e) { 
		e.stopImmediatePropagation();
		let name=$(this).attr('id')+"Value";
		$('#'+name).text($(this).val())

		let id = $(this).attr('id');
		let val=($(this).val());
		processSlider(id,val); 

	});

	$(function(){
		var $select = $(".presetSelect");
		for (i=1;i<=122;i++){
			$select.append($('<option></option>').val(i).html(i))
		}})

	$('input[type=radio][name=radio-group1]').on('change', function() {
		processSwitch(this.value);
	});
	$('input[type=radio][name=radio-group2]').on('change', function() {
		processSwitch(this.value);
	});
	$('input[type=radio][name=radio-group3]').on('change', function() {
		processSwitch(this.value);
	});
	$('input[type=radio][name=toggle]').on('change', function() {
		processSwitch(this.value);
	});
	$('#killButton').on('click', function() {
		processSwitch("bypass");
	});
	$('.blooper-btn').on('click', function (e){
		e.stopImmediatePropagation();
		let id = $(this).attr('id');
		processBlooperButton(id);

	})	

	$('#midiOutputButton').on('click', function() { 
		setOutput();
	})	

	$('#presetButton').on('click', function() { 
		processPreset();
	})

});

function processSwitch(name) {
	let lookup = switchMap[name]
	let cc = lookup[0];		
	let value = lookup[1]
	let x= outputDevice.sendControlChange(cc, value, midiChannel);
}

function processSlider(name,val) {
	let cc = sliderMap[name]
	outputDevice.sendControlChange(cc, val, midiChannel);
}
function processPreset(){
	let num= $('#presetSelect').val();
	outputDevice.sendProgramChange(parseInt(num),midiChannel)
}
function setOutput(){
	let output = $('#midiSelect').val();
	outputDevice=WebMidi.getOutputByName(output);
	console.log(outputDevice);
}
function processBlooperButton(id){
	let value = blooperButtonValues[id] ==0?1:0
	blooperButtonValues[id] =  value;
	let cc= sliderMap[id]

	let x= outputDevice.sendControlChange(cc, value, midiChannel);
}



