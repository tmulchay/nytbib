chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {

    try {
        var page_source = request.source;
        var test = getMeta(page_source)
        var props = getMetaProps(test)
        message.innerHTML = "MLA: <br>" + generateMLA(props)
    } catch(err) {
        console.log(err)
        message.innerText = "Can't generate citation for this page"
    }
  }
});

function author_string_from_name(name){
    names = name.split(" ")
    author_string = names[names.length - 1] + ", "
    for (var i = 0; i < names.length - 1; i++){
        author_string += " " + names[i]
    }
    return author_string
}

function date_string_from_pdate(pdate){
    year = pdate.substring(0, 4)
    month = pdate.substring(4, 6)
    day = pdate.substring(6, 8)
    months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June",
      "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

    return String(parseInt(day)) + " " + months[parseInt(month) - 1] + " " + year + ". "
}

function date_string_from_date(date){
    months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June",
      "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

    return String(date.getDay()) + " " + months[date.getMonth() - 1] + " " + String(date.getFullYear()) + ". "
}

function generateMLA(data){
    if (data["PT"] == "article" || data["PT"] == "Blogs"){
        author = data["author"]
        author_list = author.split(/ and |, /)
        if (author_list.length == 1){
            if (author == "The Editorial Board"){
                author_string = data["author"]
            } else {
                author_string = author_string_from_name(author)
            }
        } else {
            author_string = author_string_from_name(author_list[0])
            // author_string = author_string.slice(0, author_string.length-1)
            for (var i=1; i<author_list.length; i++){
                if (i == author_list.length - 1){
                    author_string += " and " + author_list[i]
                } else {
                    author_string += ", " + author_list[i]
                }
            }
        }
        if (author_string.charAt(author_string.length - 1) != '.'){
            author_string += "."
        }
        citation = author_string + " "
        citation += '"' + data["hdl"] +'." <i>The New York Times</i> '
        citation += date_string_from_pdate(data["pdate"])
        citation += "Web. "
        now = new Date()
        citation += date_string_from_date(now)

    }
    return citation
}

function getMetaProps(meta_tag_list){
    var name_re = /name="[^"]+"/i;
    var content_re = /content="[^"]+"/i;
    var info = {}
    for (var i=0; i < meta_tag_list.length; i++){
        tag = meta_tag_list[i];
        console.log(tag)
        match = tag.match(name_re)
        console.log(match)
        if (match == null){
            continue
        }
        name = match[0].slice(6, match[0].length - 1)
        match = tag.match(content_re)
        console.log(match)
        if (match == null){
            continue
        }
        content = match[0].slice(9, match[0].length - 1)
        info[name] = content
    }

    return info
}

function getMeta(html_text){
    var re = /(<meta name([^>]+)>)/ig;
    var found = html_text.match(re);
    if (found == null){
        found = []
    }
    return found
}

function onWindowLoad() {

  var message = document.querySelector('#message');

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function() {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });

}

window.onload = onWindowLoad;