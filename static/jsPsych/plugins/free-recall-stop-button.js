jsPsych.plugins['free-recall-stop-button'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'free-recall-stop-button',
    description: '',
    parameters: {
      preamble: {
        type: [jsPsych.plugins.parameterType.STRING],
        default: '',
        description: ''
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'The maximum duration to wait for a response.',
        required: true,
      },

      choices: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Choices',
        default: undefined,
        array: true,
        description: 'The labels for the buttons.'
      },
      button_html: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button HTML',
        default: '<button class="jspsych-btn">%choice%</button>',
        array: true,
        description: 'The html of the button. Can create own style.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed under the button.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, then trial will end when user responds.'
      },
      button_disabled: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Button Disabled Duration',
        default: 0,
        description: 'Time in ms that the button cannot be pressed for'
      },

      timeout: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Response timeout',
        default: null,
        description:'Inter response time after which recall ends'
      },
      show_countdown: {
        type: jsPsych.plugins.parameterType.BOOLEAN,
        pretty_name: 'Show countdown',
        default: false,
        description: "switch to toggle visibility of visual countdown above recall box"
      },
      countdown_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: ' Countdown duration',
        default: null,
        description: "The milliseconds before trial end at which to start countdown"
      },
      step: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Timestep to update progress bar',
        default: 5,
        description: 'The frequency at which the progress bar is updated with a new value.'
      },
      max_length: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Minimum response length',
        default: 12,
        description: "The minimum number of letters that must be entered for a response to be logged."
      },
      min_length: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Minimum response length',
        default: 1,
        description: "The minimum number of letters that must be entered for a response to be logged."
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    trial.preamble = typeof trial.preamble == 'undefined' ? "" : trial.preamble;

    var startTime         = jsPsych.totalTime(); 
    var absoluteTaskEnd   = startTime + trial.trial_duration;
    var enableButton      = startTime + trial.button_disabled;
    var taskEnd           = (trial.timeout == null ? absoluteTaskEnd : startTime + trial.timeout);

    // if any trial variables are functions
    // this evaluates the function and replaces
    // it with the output of the function
    // trial = jsPsych.pluginAPI.evaluateFunctionParameters(trial);

    // show preamble text
    display_element.innerHTML += '<div id="jspsych-free-recall-preamble" class="jspsych-free-recall-preamble">'+trial.preamble+'</div>';

    if(trial.countdown_duration == null) {
      trial.countdown_duration = trial.trial_duration;
    }

    if(trial.show_countdown) {
      display_element.innerHTML += '<progress id="progressbar" value="0" max="100"></progress>';
    }

    // add question and textbox for answer
    display_element.innerHTML += '<div id="jspsych-free-recall" class="jspsych-free-recall-question" style="margin: 2em 0em;">'+
      '<input class="task-input" name="jspsych-free-recall-response" id="recall_box" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" pattern=".{' + trial.min_length + ',' + trial.max_length + '}" required autofocus="true">'+
      '</div>';

    // set up response collection
    var rts = [];
    var recalled_words = [];
    var key_presses = [];
    var key_times = [];

    // $(function(){
    //   $('input').focus();
    // })
    
    // chrome workaround January 2020
    document.querySelector(".task-input").focus();

    var set_response_timeout= function() {
      if(trial.timeout != null) {
        clearTimeout(response_timeout);
        response_timeout = jsPsych.pluginAPI.setTimeout(end_trial, trial.timeout);

        taskEnd = Math.min(jsPsych.totalTime() + trial.timeout, absoluteTaskEnd);
      }
    }

    var keyboard_listener = function(info) {
       // set up response collection
      key_presses.push(info.key)
      key_times.push(info.rt)

      set_response_timeout();

      if (info.key=== ',' | info.key==='Enter' | info.key===';' | info.key===' ') {
        word = document.querySelector('#recall_box').value;

        if(word.length >= trial.min_length && word.length <= trial.max_length) {
          // get response time (when participant presses enter)
          rts.push(info.rt);
          // get recalled word

          word = document.querySelector('#recall_box').value;
          recalled_words.push(word);

          // empty the contents of the textarea
          document.querySelector('#recall_box').value = '';
        }

        return false;
      }

      return true;
    }

    

    var buttons = [];
    if (Array.isArray(trial.button_html)) {
      if (trial.button_html.length == trial.choices.length) {
        buttons = trial.button_html;
      } else {
        console.error('Error in html-button-response plugin. The length of the button_html array does not equal the length of the choices array');
      }
    } else {
      for (var i = 0; i < trial.choices.length; i++) {
        buttons.push(trial.button_html);
      }
    }
    display_element.innerHTML += '<div id="jspsych-html-button-response-btngroup">';
    for (var i = 0; i < trial.choices.length; i++) {
      var str = buttons[i].replace(/%choice%/g, trial.choices[i]);
      display_element.innerHTML += '<div class="jspsych-html-button-response-button" style="display: inline-block; margin:'+trial.margin_vertical+' '+trial.margin_horizontal+'" id="jspsych-html-button-response-button-' + i +'" data-choice="'+i+'">'+str+'</div>';
    }
    display_element.innerHTML += '</div>';
  
    //show prompt if there is one
    if (trial.prompt !== null) {
      display_element.innerHTML += trial.prompt;
    }
   
    var start_time = performance.now();
  
    // add event listeners to buttons
    for (var i = 0; i < trial.choices.length; i++) {
      display_element.querySelector('#jspsych-html-button-response-button-' + i).addEventListener('click', function(e){
        console.log(performance.now() - startTime)
        console.log(trial.button_disabled)
        if(performance.now() - startTime > trial.button_disabled){
          var choice = e.currentTarget.getAttribute('data-choice'); // don't use dataset for jsdom compatibility
          after_response(choice);
        }
      });
    }

     // store response
     var response = {
      rt: null,
      button: null

    };
  
    // function to handle responses by the subject
    function after_response(choice) {
  
      // measure rt
      var end_time = performance.now();
      var rt = end_time - start_time;
      response.button = choice;
      response.rt = rt;
  
      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
  
      // disable all the buttons after a response
      var btns = document.querySelectorAll('.jspsych-html-button-response-button button');
      for(var i=0; i<btns.length; i++){
        //btns[i].removeEventListener('click');
        btns[i].setAttribute('disabled', 'disabled');
      }
  
      if (trial.response_ends_trial) {
        end_trial();
      }

    };

    var end_trial = function() {
      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // clear the display
      display_element.innerHTML = '';

      // gather the data to store for the trial
      var trial_data = {
        "rt": rts,
        "recwords": recalled_words,
        "key_presses": key_presses,
        "key_times": key_times,
        "start_time": startTime,
        "response": response,
      };

     
      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // set progressbar timeout
    var updateProgress = function() {
      var remaining = taskEnd - jsPsych.totalTime();
      var length = trial.countdown_duration == null ? trial.trial_duration : trial.countdown_duration;
      var val = (1 - (remaining / length)) * 100;

      display_element.querySelector('#progressbar').style.visibility = remaining < length ? 'visible' : 'hidden';
      display_element.querySelector('#progressbar').value = val;

      jsPsych.pluginAPI.setTimeout(updateProgress, trial.step);
    }

    // set initial progress bar state and timeout
    if(trial.show_countdown) {
      updateProgress();
    }


    var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
              callback_function: keyboard_listener,
              rt_method: "performance",
              allow_held_key: false,
              persist: true,
              propagate: true
        })

    if(trial.timeout != null) {
      var response_timeout = jsPsych.pluginAPI.setTimeout(end_trial, trial.timeout);
    }

    if (trial.trial_duration > 0) {
      jsPsych.pluginAPI.setTimeout(end_trial, trial.trial_duration);
    }
  };

  return plugin;
})();