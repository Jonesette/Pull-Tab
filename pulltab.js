var db;
var jQT = $.jQTouch({
    icon: 'pulltab-icon.png',
    startupScreen: 'pulltab-startup.png',
    statusBar: 'black'
});

$(document).ready(function() {
    $('#createEntry form').submit(createEntry);
    $('#settings form').submit(saveSettings);
    $('#settings').bind('pageAnimationStart', loadSettings);
    $('#sports li a').click(function(){
        var sportClicked = this.id;
        var sport = new Date();
        sport.setDate(sportClicked);
        sessionStorage.currentSport = sportClicked;
        refreshEntries();
    });
    var shortName = 'PullTab';
    var version = '1.0';
    var displayName = 'PullTab';
    var maxSize = 65536;
    db = openDatabase(shortName, version, displayName, maxSize);
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'CREATE TABLE IF NOT EXISTS entries ' +
                ' (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, ' +
                ' sport TEXT NOT NULL, score1 INTEGER NOT NULL, ' +
                ' score2 INTEGER NOT NULL, ' +
                ' team2 TEXT NOT NULL, ' +
                ' team1 TEXT NOT NULL );'
            );
        }
    );
});

function saveSettings() {
    localStorage.firstname = $('#firstname').val();
    localStorage.lastname = $('#lastname').val();
    jQT.goBack();
    return false;
}

function loadSettings() {
    $('#firstname').val(localStorage.firstname);
    $('#lastname').val(localStorage.lastname);
}

function refreshEntries() {
    var currentSport = sessionStorage.currentSport;
    $('#sport h1').text(currentSport);
    $('#sport ul li:gt(0)').remove();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'SELECT * FROM entries WHERE sport = ? ORDER BY score1;',
                [currentSport],
                function (transaction, result) {
                    for (var i=0; i < result.rows.length; i++) {
                        var row = result.rows.item(i);
                        var newEntryRow = $('#entryTemplate').clone();
                        newEntryRow.removeAttr('id');
                        newEntryRow.removeAttr('style');
                        newEntryRow.data('entryId', row.id);
                        newEntryRow.appendTo('#sport ul');
                        newEntryRow.find('.label').text(row.score1);
                        newEntryRow.find('.score2').text(row.score2);
                        newEntryRow.find('.team1').text(row.team1);
                        newEntryRow.find('.team2').text(row.team2);
                        newEntryRow.find('.delete').click(function(){
                            var clickedEntry = $(this).parent();
                            var clickedEntryId = clickedEntry.data('entryId');
                            deleteEntryById(clickedEntryId);
                            clickedEntry.slideUp();
                        });
                    }
                },
                errorHandler
            );
        }
    );
}
function createEntry() {
    var sport = sessionStorage.currentSport;
    var team1 = $('#team1').val();
    var team2 = $('#team2').val();
    var score2 = $('#score2').val();
    var score1 = $('#score1').val();
    db.transaction(
        function(transaction) {
            transaction.executeSql(
                'INSERT INTO entries (sport, score2, score1, team1, team2) VALUES (?, ?, ?, ?, ?);',
                [sport, score2, score1, team1, team2],
                function(){
                    refreshEntries();
                    jQT.goBack();
                },
                errorHandler
            );
        }
    );
    return false;
}

function errorHandler(transaction, error) {
    alert('Oops. Error was '+error.message+' (Code '+error.code+')');
    return true;
}

function deleteEntryById(id) {
    db.transaction(
        function (transaction) {
            transaction.executeSql('DELETE FROM entries WHERE id=?;', [id], null, errorHandler);
        }
    );
}
