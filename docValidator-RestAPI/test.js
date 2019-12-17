async.each(urls, function(url, callback){
        console.log("Grabbing Dataset from " + url);
        makeRequest(url, function(){
          callback();
        });
      }, function(err){
          console.log("Hello");
          if(err){
            console.log("Error grabbing data");
          } else {
            console.log("Finished processing all data");
          }
     }
    );