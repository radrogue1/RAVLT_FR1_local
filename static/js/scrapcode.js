  /*records auditory responses, ends when participant hits the a key (dysfunctional in current psiturk, implement later)*/
    // var recordResponses = {
    //     type: "html-audio-response",
    //     stimulus: "<p class = inst> Recording </p>",
    //     buffer_length: -1,
    //     manually_end_recording_key: jsPsych.data.aLL_KEYS,
    // };
    
    /*Typed recall used for the RAVLT*/
    // function RAVLT_recallA_with_check() {
    //     var RAVLT_recallA = {
    //         type: 'free-recall-stop-button',
    //         preamble: "<p class = inst> Type as many words as you can remember. </p>",
    //         min_length: 2,
    //         max_length: 15,
    //         choices: ["I can't remember any more words"],
    //         data: {type: 'recall', phase: 'RAVLT', recall_type: 'free'}
    //     };

    //     // TODO: ask them to return the HIT due to failed attention check
    //     let check_failed = {
    //         type: 'html-keyboard-response',
    //         response_ends_trial: false,
    //         stimulus: "<p class='inst'>Due to the speed at which you stopped the recall period, we ask that you return this HIT to MTurk at this time.</p>"
    //     }

    //     let check_failed_node = {
    //         timeline: [check_failed],
    //         conditional_function: function(){
    //             var data = jsPsych.data.get().last(1).values()[0];
    //             console.log(data.response.rt)
    //             if(data.response.rt > 5000) {
    //                 return false;
    //             } else {
    //                 return true;
    //             }
    //             return true;
    //         }
    //     }

    //     return { timeline: [RAVLT_recallA, check_failed_node] };
    // }
