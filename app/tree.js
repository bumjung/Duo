var path = require('path'),
    fs = require('fs'),
    encoder = require('./encoder.js');
var tree = {
    folderContentTree: function (filename, index, dict){
        var self = this;
        var string="";
        fs.readdirSync(filename).map(function(child) {
            if(child) string=string+self.renderTree(filename + '/' + child, index, dict).render;
        });
        return {render: string, dict: dict};
    },
    folderTree: function (filename, index, dict){
        var self = this;
        var string="";
        var name=path.basename(filename);
        if(name=='.'){
            name='root';
        }
        string="<ul class='folder-container'><li class='fa fa-folder-open folder'>"+name+"</li><div class='child-container'><ul class='child'>"+self.folderContentTree(filename, index+1, dict).render+"</ul></div>"+"</ul>\n";
        return {render: string, dict: dict};
    },
    renderTree: function (filename, index, dict) {
        var self = this;
        if(filename.indexOf("node_modules") > -1 || filename.indexOf("bower_components") > -1 || filename.indexOf(".DS_Store") > -1 || filename.indexOf("framework") > -1 ) return {render:"", dict:dict};
        
        filename=path.normalize(filename);
        var stats = fs.lstatSync(filename);
        if (stats.isDirectory()) {
            var string=self.folderTree(filename, index, dict);
            return string;
        }
        var data = {
                path: filename,
                name: path.basename(filename)
        };
        var id = encoder.encode(filename+index);
        dict[id] = data;
        if(path.extname(data.name)){
            data.type = path.extname(data.name).substr(1);
            if(data.type == "css") data.type="css";
            else if(data.type == "js") data.type="javascript";
        }
        else{
            data.type="text";
        }
        return {render: "<li id='"+id+"' class='file fa fa-file-code-o'>"+data.name+"</li>", dict: dict};
    }
}

module.exports=tree;