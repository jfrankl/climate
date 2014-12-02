function openParameter () {
    $(this).closest('.indicator').toggleClass('open');
    console.log($(this).parent());
}

function highlightParameter () {
}

$('.btn-parameter').on('click', openParameter);
$('.btn-parameter').on('mouseover', function () {
    $(this).closest('.indicator').addClass('hover');
});
$('.btn-parameter').on('mouseout', function () {
    $(this).closest('.indicator').removeClass('hover');
});
