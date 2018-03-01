export function urlParam (name) {
    
    var results = new RegExp('[\?&]' + name + '=([^&#]*)')
                      .exec(window.location.href);
    if(results === null){
        return "";
    }
    return results[1] || 0;
}
