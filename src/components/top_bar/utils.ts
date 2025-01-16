export const readFileAsync = (file:Blob) =>{
    return new Promise((resolve, reject)=>{
        const fileReader = new FileReader()
        fileReader.onloadend= (e)=>{
            if(e?.target?.error){
                reject("File read failed.")
            }else{
                resolve(e?.target?.result)
            }
        }
        fileReader.readAsText(file)
    })
}