
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('semtag', { title: 'SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.min.js']});
};

exports.sw = function(req, res){
  res.render('sw', { title: 'Single Word SemTag', scripts: ['http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js', 'javascripts/dist/SemTag.js']});
};

exports.test = function(req, res){
  res.render('testrunner', {title: 'SpecRunner', specs: ['javascripts/spec/semtag_spec.js'], sources: ['javascripts/semtag.js', 'http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js'] });
};