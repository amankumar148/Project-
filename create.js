 jscreate.js (Dynamic Subject Row Logic)

$('#addSubjectRow').on('click', function() {
    const newRow = `
        tr
            tdinput type=text class=form-control subject-name requiredtd
            tdinput type=number class=form-control subject-marks min=0 max=100td
            tdbutton type=button class=btn btn-danger btn-sm delete-subject-rowDeletebuttontd
        tr
    `;
    $('#subjectTableBody').append(newRow);
});

 Delete handler (using delegation)
$('#subjectTableBody').on('click', '.delete-subject-row', function() {
    $(this).closest('tr').remove();
});