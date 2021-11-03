async function runExperiment() {

    /* - - - - PSITURK - - - - */
  
    var psiturk = new PsiTurk(uniqueId, adServerLoc, mode);
  
    // Record screen resolution & available screen size
    psiturk.recordUnstructuredData('screen_width', screen.width)
    psiturk.recordUnstructuredData('screen_height', screen.height)
    psiturk.recordUnstructuredData('avail_screen_width', screen.availWidth)
    psiturk.recordUnstructuredData('avail_screen_height', screen.availHeight)
    psiturk.recordUnstructuredData('color_depth', screen.colorDepth)
    psiturk.recordUnstructuredData('pixel_depth', screen.pixelDepth)

    var pages = [];
  
    await psiturk.preloadPages(pages);
      
    /*Creates a timeline for the experiment*/

    let workerId = uniqueId.split(':')[0];

    function get_hash(key, n_conditions) {
        let hash = 0;
        for(let i = 0; i < key.length; i++) {
            hash += key.charCodeAt(i);
        }
        return hash % n_conditions;
    };

    function getRandomInt(max) {
        return Math.floor(Math.random() * Math.floor(max));
    }

    let condition = get_hash(workerId, 4);

    jsPsych.data.addProperties({condition: condition})

    var timeline = [];

    var random = Math.random()
    
    audio_test = jsPsychUtils.get_audio_test();
    attention_test = jsPsychUtils.get_attention_check();
    check_willing = jsPsychUtils.get_check_willing(psiturk);
    let start_recall = {
        type: "audio-keyboard-response",
        stimulus: '/static/audio/beephigh.wav',
        choices: jsPsych.NO_KEYS,
        trial_ends_after_audio: true,
        data: {type: 'tone', phase: 'RAVLT'}
    }

    let end_recall = {
        type: "audio-keyboard-response",
        stimulus: '/static/audio/beeplow.wav',
        choices: jsPsych.NO_KEYS,
        trial_ends_after_audio: true,
        data: {type: 'tone', phase: 'RAVLT'}
    }

    /*creates a fixation to flash between trials */
    var fixation = {
        type: 'html-keyboard-response',
        stimulus: '<div style="font-size:60px;">+</div>',
        choices: jsPsych.NO_KEYS,
        stimulus_duration: 1000,
        trial_duration: 1500,
        data: {type: 'fixation'},
    };

    /*welcomes participant to experiment*/
    var welcome = {
        type: "instructions",
        pages: ["<p class = inst> Thank you for participating in our experiment.</p>" +
        "<p class = inst> During this task, you will be tested on several facets of memory. </p>" +
        "<p class = inst> Press next to begin the test </p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'},
      };

    /* RAVLT */
    /*introduces the RAVLT to the participant*/ 
    
    var intro = {
        type: "instructions",
        pages: ["<p class = inst>During this task, you will hear a list of words multiple times.<br>"+ 
        "Please listen carefully, as at the end of the list you will need to type as many words from the list as you can remember.<br>" +
        "Please try to memorize as many words as you can in your head, <u> without writing them down. </u> <br>You can type the words in any order.</p>" +
        "<p class = inst>Press next to begin.</p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    };

    /*trial that speaks one audio file and has a one second gap after it ends*/
    var test = {
        type: "audio-keyboard-response",
        stimulus: jsPsych.timelineVariable("audio"),
        choices: jsPsych.NO_KEYS,
        trial_ends_after_audio: true,
        post_trial_gap: 1000,
        data: {type: 'encode', phase: 'RAVLT', recall_type: 'free'}
    }

    var speed_test = {
        type: "audio-keyboard-response",
        stimulus: jsPsych.timelineVariable("audio"),
        choices: jsPsych.NO_KEYS,
        trial_ends_after_audio: true,
        post_trial_gap: 0,
        trial_duration: 0,
        data: {type: 'encode', phase: 'RAVLT', recall_type: 'free'}
    }

    var cued_speed_test = {
        type: "audio-keyboard-response",
        stimulus: jsPsych.timelineVariable("audio"),
        choices: jsPsych.NO_KEYS,
        trial_ends_after_audio: true,
        post_trial_gap: 0,
        trial_duration: 0,
        data: {type: 'encode', phase: 'RAVLT', recall_type: 'cued'}
    }

    /*instructions after recording responses, before hearing the first list again*/
    var instructions1 = {
        type: "instructions",
        pages: ["<p class = inst>Press next to continue.</p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    };

    var RAVLT_recallA = {
            type: 'free-recall-stop-button',
            preamble: "<p class = inst> Type as many words as you can remember. </p>",
            min_length: 2,
            max_length: 15,
            button_disabled: 5000,
            choices: ["I can't remember any more words"],
            data: {type: 'recall', phase: 'RAVLT', recall_type: 'free'}
    };

    var RAVLT_recallB = {
        type: 'free-recall-stop-button',
        preamble: "<p class = inst> Type as many words as you can remember. </p>",
        min_length: 2,
        max_length: 15,
        button_disabled: 5000,
        choices: ["I can't remember any more words"],
        data: {type: 'recall', phase: 'RAVLT', recall_type: 'free'}

    };

    var st_test_procedureA = {
        timeline: [test],
        timeline_variables: st_a_audio,
        data: {listtype: 'St A'},
    }
    var st_test_procedureB = {
        timeline: [test],
        timeline_variables: st_b_audio,
        data: {listtype: 'St B'}
    }
    var st_speed_test_procedureA = {
        timeline: [speed_test],
        timeline_variables: st_a_audio,
        data: {listtype: 'St A'}
    }

    var alt_test_procedureA = {
        timeline: [test],
        timeline_variables: alt_a_audio,
        data: {listtype: 'Alt A'},
    }
    var alt_test_procedureB = {
        timeline: [test],
        timeline_variables: alt_b_audio,
        data: {listtype: 'Alt B'},
    }

    var alt_speed_test_procedureA = {
        timeline: [speed_test],
        timeline_variables: alt_a_audio,
        data: {listtype: 'Alt A'},
    }

    var music_video = {
        type: 'video-keyboard-response',
        sources: jsPsych.timelineVariable("video"),
        prompt: "<p class = inst>Press B for every new event</p>",
        rate: 1,
        autoplay: true,
        width: screen.width - 600,
        response_ends_trial: false,
        choices: jsPsych.ALL_KEYS,
        multiple_inputs: true,
        trial_ends_after_video: true,
        data: {type: 'music_vid', phase: 'RAVLT'}
    }

    var video_procedure = {
        timeline: [fixation, music_video],
        timeline_variables: music_videos,
        randomize_order: true
    }

    var music_instructions = {
        type: "instructions",
        pages: ['<p class = inst>You will now watch a series of music videos. During each music video, multiple events will occur. Please press the “B” key at any point of the music video where you believe a meaningful event shift or change has occurred. A meaningful event shift or change can be characterized as, for example, a character in a scene changing their course of action or a change in setting.</p>' +
        '<p class = inst>For example: A character goes to their car and begins driving. While driving, they change the song that is playing. Later, they stop at a red light, then continue driving until they reach their destination.<br>Examples of meaningful event shifts when you would want to press the "B" button could include the character getting into their car, beginning to drive, changing the song, stopping at the red light, and arriving at the destination.</p>' +
        '<p class = inst>Please try your best to indicate when any meaningful event shifts occur in each presented video."</p>'],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}    
    }

    function cued_test(stimuli, type){
        var cued_test_procedureA = {
            timeline: [cued_speed_test],
            timeline_variables: stimuli,
            data: {listtype: type}
        }
        return cued_test_procedureA
    }
    
    /*instructions before list B plays*/
    var instructions2 = {
        type: "instructions",
        pages: ["<p class = inst>You will now hear a second, different list of words. </p>" +
        "<p class = inst> When it is finished, you will need to type as many words from the second list as you can, in any order. </p>"+
        "<p class = inst> Don't type words from the first list, JUST this second list. </p>" +
        "<p class = inst>Press next to continue.</p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    };

    /*instructions before dFR of list A*/
    var instructions3 = {
        type: "instructions",
        pages: ["<p class = inst>Now please type all the words you can from the FIRST list, the one you heard several times. </p>"+
        "<p class = inst> Do NOT type words from the second list, just the FIRST list. </p>" +
        "<p class = inst>Press next to begin.</p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    }

    /*free recall that is used for the cued part of RAVLT*/
    function cued_fr(type){
        var cued_free_recall = {
            type: 'free-recall-stop-button',
            preamble: "<p class = inst> Type as many words that are " + type + " as you can remember. </p>",
            min_length: 2,
            max_length: 15,
            button_disabled: 5000,
            choices: ["I can't remember any more words"],
            data: {type: 'recall', phase: 'RAVLT', recall_type: 'cued: ' + type, listtype: 'List A'}
        }
        return cued_free_recall
    };
    
    /*instructions for cued free recall of list A for each category*/
    function cued_instructions(type){
        var cued_inst = {
            type: "instructions",
            pages: ["<p class = inst> Please type all the words from the FIRST list that are " + type + ".</p>" +
            "<p class = inst> Press next to begin.</p>"],
            show_clickable_nav: true,
            allow_keys: false,
            data: {type: 'instruction'}
        }
        return cued_inst
    }


    var notes = {
        type: 'html-button-response',
        stimulus:"<p class = inst>Did you write notes during this session?</p>",
        choices: ['Yes', 'No']
    }

    /*Thanks the participant for doing the experiment.*/
    var finito = {
        type: 'instructions',
        pages: ["<p class = inst> You have completed our experiment. Thank you for participating. </p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    }
    /* FR1 */
    /*create timeline*/

    /*Shows instructions for the practice of the math distractor*/
    var practiceInstructions = {
        type: "instructions",
        pages: ["<p class = inst> In this subtest, we would like to see how well you recall lists of random words."+
        "<br> In between lists, you will be given the task of solving math problems in the form 'A+B+C=', where A, B, and C are integers." +
        "<br> When you see a math problem, please type in the answer using the keypad and then press the ENTER key."+
        "<br> You can use the BACKSPACE key if you make a mistake. </p>" +
        "<p class = inst> You will now have a chance to practice the whole task, including the math task." +
        "<br> Consider this practice session as an opportunity to build up speed without sacrificing accuracy. </p>" +
        "<p class = inst> Please press next to begin.</p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    };
    
    /*Actual instructions for the free recall of the FR1*/
    var fr_instructions = {
        type: "instructions",
        pages: ["<p class = inst>In this study, words will appear on the computer screen."+
        "<br> As each word is shown make a picture in your mind of what the word refers to." + 
        "<br> Please refrain from saying the word out-loud."+
        "<br> Do not try to think back to other words in the list." +
        "<br> Also, try not to blink or move around during word presentations. </p>" +
        "<p class = inst>After the last word in each list, you will be shown several math problems."+
        "<br> Answer them as quickly and accurately as you can." +
        "<br> When you have completed these math problems, you will see a fixation (+) flash on the screen." +
        "<br> At this time, type as many words as you can remember from the list, IN ANY ORDER."+ 
        "<br> You will have a fixed amount of time in which to recall the list. </p>" +
        "<p class = inst>Please try hard throughout the recall period, as you may recall "+
        "<br>some words even when you feel you have exhausted your memory.</p>"+
        "<p class = inst> Please press next to begin.</p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    };

    var countdown = {
        type: 'countdown',
        seconds: 10,
        post_trial_gap: 1500,
        data: {type: countdown}
    }

    /*Plays each word on the screen for the encoding of the FR1*/
    var FR1test = {
        type: "html-keyboard-response",
        stimulus: jsPsych.timelineVariable('word'),
        choices: jsPsych.NO_KEYS,
        stimulus_duration: 1600,
        trial_duration: 2350 + getRandomInt(251),
        data: {type: 'encode', phase: 'FR1', recall_type: 'free'}

    };

    /*Records typed recall*/
    var free_recall = {
        type: 'free-recall',
        min_length: 2,
        max_length: 15,
        trial_duration: 30000,
        data: {type: 'recall', phase: 'FR1', recall_type: 'free'}
    };

    check_failed = {
        type: 'html-keyboard-response',
        response_ends_trial: false,
        stimulus: "<p class='inst'>The preceding task were designed to screen participants who are not carefully following the instructions of our study.<p>" +
        "<p class='inst'>Based on your performance on the practice list, we ask that you return this HIT to MTurk at this time.</p>"
    };

    function practice_test(words) {
        correct = 0;
        let fr_loop = {
            //  run the recall
            timeline: [free_recall],
            loop_function: function(data){
                // gather the data from the recall
                data_len = data.values()[0].recwords.length
                resp = data.values()[0].recwords
                upp_resp = resp.map(resp => resp.toUpperCase());
                list_len = words.length
                fixed_words = []
                // get words from the data objects
                for(i = 0; i < list_len; i++){
                    fixed_words[i] = words[i].word
                }
                //check whether recalled word was correct
                for(i = 0; i < data_len; i++){
                    if(fixed_words.includes(upp_resp[i])){
                        correct++;
                    }
                }
            }
        }

        let check_failed_node = {
            timeline: [check_failed],
            conditional_function: function(){
                // check if participant recalled at least 1 word correctly
                // if not, the participant gets locked out of the experiment
                if(correct < 1) {
                    return true;
                }
                else {
                    return false;
                }
            } 
        }
        return { timeline: [fr_loop, check_failed_node] };
    }
    
    /*Distractor used in the FR1*/
    var math_distractor = {
        type: 'math-distractor',
        trial_duration: 20000,
        data: {type: 'distractor'}
    };

    var notes = {
        type: 'html-button-response',
        stimulus:"<p class = inst>Did you write notes during this session?</p>",
        choices: ['Yes', 'No']
    }

    /*Thanks the participant for doing the experiment.*/
    var finito = {
        type: 'instructions',
        pages: ["<p class = inst> You have completed our experiment. Thank you for participating. </p>"],
        show_clickable_nav: true,
        allow_keys: false,
        data: {type: 'instruction'}
    }
    if(condition == 0 || condition == 2){
        var lists = [
            A_1, A_2, 
            A_3, A_4, 
            A_5, A_6, 
            A_7, A_8, 
            A_9, A_10, 
            A_11, A_12, 
            A_13, A_14, 
            A_15, A_16, 
            A_17, A_18, 
            A_19, A_20,
            A_21, A_22, A_23
        ]
    } else {
        var lists = [
            B_1, B_2, 
            B_3, B_4, 
            B_5, B_6, 
            B_7, B_8, 
            B_9, B_10, 
            B_11, B_12, 
            B_13, B_14, 
            B_15, B_16, 
            B_17, B_18, 
            B_19, B_20,
            B_21, B_22, B_23
        ]
    }
    /*BLOCKING*/
    function FR1() {
        timeline = timeline.concat(practiceInstructions, fixation)
        /* Generate Practice List of 12 Words */
        var FR1_practice = {
            timeline: [FR1test],
            timeline_variables: pwp,
        };
        timeline = timeline.concat(countdown, FR1_practice, fixation,  math_distractor, fixation, start_recall, practice_test(pwp), end_recall, fr_instructions);
        //Generate lists for main trials
        for (var list = 0; list < 23; list++){
            timeline.push(fixation);
            var trial_wp = lists[list];
            var FR1_test_procedure = {
                timeline: [FR1test],
                timeline_variables: trial_wp,
                randomize_order: false
            };
            timeline = timeline.concat(countdown, FR1_test_procedure, fixation, math_distractor, fixation, start_recall, free_recall, end_recall);
        }
    }

    /*BLOCKING*/
    function RAVLT() {
        test_procedureA = st_test_procedureA
        test_procedureB = st_test_procedureB
        speed_test_procedureA = st_speed_test_procedureA
        //     test_procedureA = alt_test_procedureA
        //     test_procedureB = alt_test_procedureB
        //     speed_test_procedureA = alt_speed_test_procedureA
        timeline = timeline.concat(audio_test, intro) 
        for(var i = 0; i < 5; i++){
            timeline = timeline.concat(fixation, test_procedureA, fixation, RAVLT_recallA);
        }
        timeline = timeline.concat(instructions2, fixation, test_procedureB, fixation, RAVLT_recallB, fixation)
        timeline = timeline.concat(instructions3, fixation, speed_test_procedureA, RAVLT_recallA);
        timeline = timeline.concat(music_instructions, video_procedure, fixation, instructions3, fixation, speed_test_procedureA, RAVLT_recallA);
    }
    /* FULL BLOCKING*/
    timeline.push(check_willing)
    timeline = timeline.concat(attention_test, welcome)
    if(condition < 2){
        FR1()    
    }
    else{
        RAVLT()
    }
    timeline.push(notes, finito);
    window.onbeforeunload = function() {
      return "Warning: Refreshing the window will RESTART the experiment from the beginning! Please avoid refreshing your browser while the task is running.";
    }
  
    /* - - - - EXECUTION - - - - */
    jsPsych.init({
        timeline: timeline,
        preload_audio: [staudio, altaudio],
        preload_video: videos,
        exclusions: {audio: true},
        use_webaudio: false,
        on_finish: function() {
            // jsPsych.data.get().localSave('csv','mydata.csv');
            psiturk.saveData();
            Questionnaire(psiturk);
        },
        on_data_update: function(data) {
            psiturk.recordTrialData(data);
            psiturk.saveData();
        },
        exclusions: {
          min_width: 800,
          min_height: 600
        }
    });
  }