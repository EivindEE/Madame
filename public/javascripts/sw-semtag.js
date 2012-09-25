$('.container').click(function () {
	$.get("http://lexitags.dyndns.org:8080/server/lexitags2/Semtags?data={'word':'dog}", function (data) {
		console.log(data);
	});
});