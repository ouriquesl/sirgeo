$(document).ready(function() {

	// MODAL
	$('#loadModal').load('master.html #modal-container', function(){
		
		// ON OPEN ANY MODAL
		$('.modal').on('show.bs.modal', function (e) {
		  	var link = e.relatedTarget,
		  		modal = e.target;

			// DINAMIC TITLE
		  	$(link).data('title') ? $(modal).find('.modal-title').html($(link).data('title')) : true;

		  	// DINAMIC DESCRIPTION
		  	$(link).data('desc') ? $(modal).find('.modal-body').html($(link).data('desc')) : true;


		});

		// ON OPEN CONFIRM MODAL
		$('#modal_confirm').on('show.bs.modal', function (e) {

			var link = e.relatedTarget,
		  		modal = e.target;

		  	// ACTION
		  	$(link).data('action') ? $(modal).find('.confirm-action').attr('data-action', $(link).data('action')) : $(modal).find('.modal-action').attr('data-action', '');

		  	// REF
		  	$(link).data('ref') ? $(modal).find('.confirm-action').attr('data-ref', $(link).data('ref')) : $(modal).find('.confirm-action').attr('data-ref', 'sistema');

		}).find('.confirm-action').click(function(event) {
    		console.log('Realizar a ação de '+ $(this).attr('data-action') +' na referencia '+ $(this).attr('data-ref') );
    		toastr.success("Ação realizada com sucesso!");
    		$('#modal_confirm').modal('hide');
		});

		// MODAL TOUR

		$('#modal_tour').on('hidden.bs.modal', function (e) {
			$('#slide_tour').carousel(0);
		});
		$('#slide_tour').on('slide.bs.carousel', function (e) {
			var indicators = $('#slide_tour').find('.carousel-indicators');
		  	e.to == 0 || e.to == indicators.find('li').length - 1 ? indicators.hide() : indicators.css('display','flex');
		}).find('.btn-tour').click(function(event) {
			$('#slide_tour').find('[data-slide="next"]').click();
		});
	});
});