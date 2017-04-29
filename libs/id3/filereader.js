/**
 * Copyright (c) 2010 António Afonso, antonio.afonso gmail, http://www.aadsm.net/
 * MIT License [http://www.opensource.org/licenses/mit-license.php]
 *
 */

((ns => {
    ns["FileAPIReader"] = file => (url, fncCallback, fncError) => {
        var reader = new FileReader();

        reader.onload = event => {
            var result = event.target.result;
            fncCallback(new BinaryFile(result));
        };
        reader.readAsBinaryString(file);
    };
}))(this);