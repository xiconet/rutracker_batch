// ==UserScript==
// @name         RuTracker.org Batch Downloader
// @namespace    nikisby
// @version      0.6
// @description  Batch download all torrents from search results on RuTracker.org
// @author       nikisby
// @match        http://rutracker.org/forum/tracker.php*
// @require      https://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.0/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/2.5.0/jszip.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2014-11-29/FileSaver.min.js
// @grant        GM_xmlhttpRequest
// ==/UserScript==

this.$ = this.jQuery = jQuery.noConflict(true);

var date = new Date(0);
document.cookie = "tr_simple=; domain=.rutracker.org; path=/forum/; expires=" + date.toUTCString();

var torName, torText, zipFile, fileName, url, count, number, page, files;

var zip = new JSZip();

function addTorrent(url, number){
    count++;
    GM_xmlhttpRequest({
        method: 'POST',
        url: url,
        overrideMimeType: 'text/plain; charset=x-user-defined',
        onload: function(response) {
            $('#batch-down').text('Loading… ' + (number - count));
            torName = response.responseHeaders.match(/filename="(.*?)"/);
            if (torName) {
                files++;
                torText = response.responseText;
                zip.file(torName[1], torText, {binary: true});
            }
            if (count == number) saveZip();
        },
        onabort: function(response) {
            if (count == number) saveZip();
        },
        onerror: function(response) {
            if (count == number) saveZip();
        },
        ontimeout: function(response) {
            if (count == number) saveZip();
        }
    });
}

function saveZip(){
    var add = '';
    fileName = $('#title-search').attr('value') || 'torrents';
    page = $('.bottom_info > .nav > p:eq(1) > b').text();
    if (page) add = ' #' + page;
    zipFile = zip.generate({type:'blob'});
    saveAs(zipFile, fileName + add + ' [' + files + '].zip');
    $('#batch-down').prop('disabled', false).text('Download all');
}

$('#tr-submit-btn').parent().append('<button id="batch-down" class="bold" style="margin-left: 20px; width: 140px; font-family: Verdana,sans-serif; font-size: 11px;">Download all</button>');

$('#batch-down').click(function(e){ 
    e.preventDefault();
    $('#batch-down').prop('disabled', true);
    count = 0;
    files = 0;
    number = $('#tor-tbl td:nth-child(6)').length;
    if (number) {
        $('#tor-tbl td:nth-child(6)').each(function(i, el){
            setTimeout(function(){
                url = $(el).find('.dl-stub').attr('href');
                addTorrent(url, number);
            }, 500 + ( i * 500 ));
        });
    } else return;
});
