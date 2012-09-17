
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('semtag', { title: 'SemTag' });
};
exports.test = function(req, res){
  res.render('testrunner', {title: 'SpecRunner', specs: ['javascripts/spec/semtag_spec.js'], sources: ['javascripts/semtag.js'] });
};