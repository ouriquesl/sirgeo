$(document).ready(function() {
	applyMask ($('main'));
});

function applyMask (container){
	// TELEFONE
    container.find('.mask-tel').mask('(00) 0000-00009',{clearIfNotMatch: true});

    // DATE
    container.find('.mask-date').mask('00/00/0000',{clearIfNotMatch: true});

    // DATE - HOUR
    container.find('.mask-dateTime').mask('00/00/0000 00:00',{clearIfNotMatch: true});

    // NÚMERO
    container.find('.mask-number').mask('#');
}