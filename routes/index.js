var express = require('express')
var router = express.Router()
var spawn = require('child_process').spawn
var fs = require('fs')
var multer = require('multer')
var path = require('path')
var upload = multer()

router.post('/', upload.single('ofx'), function(req, res, next) {
  if(!req.file)
    return res.status(404).end()

  let content = req.file.buffer
  fs.mkdtemp('/tmp/ofx-', (err, tmp_dir) => {
    if(err) return res.status(500).render('error', {error:err})
    let tmp_file_in = path.join(tmp_dir, "in")
    let tmp_file_out = path.join(tmp_dir, "out")

      fs.writeFile(tmp_file_in, content, (err) => {
        if(err) return res.status(500).render('error', {error:err})
          let proc = spawn('ruby', ['convert.rb', tmp_file_in, tmp_file_out])
            proc.stderr.setEncoding("utf8")

            let stderr = ""

            proc.stderr.on('data', (data) => {
              stderr += data.toString()
            })

        proc.on('error', (err) => {
          res.status(500).render('error', {error: err})
        })

        proc.on('close', (code) => {
          if(code != 0)
            res.status(500).render('error', {error: {
              status: `exit code ${code}`,
              stack: stderr.toString()
            }})
          else{
            res.attachment('generated.csv')
              fs.readFile(tmp_file_out, (err, data) => {
                if(err) return res.status(500).render('error', {error: err})
                  res.send(data)
              })
          }
        })

        proc.stdin.end()


      })
  })

})

router.get('/', (req, res, next) => {
  res.render('index')
})

module.exports = router
