
export function query_string_to_query_dict(query_string) {
    const query_array = query_string.slice(1).split('&');
    const query_dict = {};
    query_array.forEach(v => {
        const a = v.split('=')
        if(a[0]) {
            query_dict[a[0]] = a[1];
        }
    });
    return query_dict;
}


export function sort_LOD_by_key(LOD, sort_key, ascending=true) {
    const temp_list = [...LOD];
    if(ascending) {
        temp_list.sort((a, b) => {
            if (a[sort_key] < b[sort_key]) return -1;
            if (a[sort_key] > b[sort_key]) return 1;
            return 0;
        });
    }
    else {
        temp_list.sort((a, b) => {
            if (a[sort_key] > b[sort_key]) return -1;
            if (a[sort_key] < b[sort_key]) return 1;
            return 0;
        });
    }
    return temp_list;
}


export function debounce(fn, ms) {
    let timer; 
    return () => { 
        clearTimeout(timer); 
        timer = setTimeout(() => { 
            timer = null;  
            fn.apply(this, arguments);  
        }, ms); 
    }; 
}


export function create_lookup_dict(arr, key_field) {
    const d = {};
    arr.forEach(v => d[v[key_field]] = v);
    return d;
}


export function ema(x, Nma) {
    const y = new Array(x.length).fill(0);
    const alpha = 2 / (Nma + 1);
    y[0] = x[0];
    for (let i=1; i<x.length; i++) {
        y[i] = alpha * x[i] + (1 - alpha) * y[i-1];
    }
    return y;
}