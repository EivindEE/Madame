#!/usr/bin/perl

use WordNet::QueryData;
use JSON;
my $wn = WordNet::QueryData->new(
	dir => "/usr/local/Wordnet-3.0/dict",
	noload => 1);
my $json = JSON->new->allow_nonref;


#print encode_json parent_and_siblings('person#n#1');
my @parent = parent('self#n#1');

my $parent = @parent;
print $parent, "\n";
while ($parent){
	@parent = parent(@parent);
	$parent = @parent;
	print @parent, "\n";	
}

#sub parent_and_siblings {
#	my @parent = parent($_[0]);
#	my @siblings = siblings(@parent);
#
#	return {"parent" => [@parent],"siblings" => [@siblings]};
#}

sub parent {
	return $wn->querySense($_[0], "hype");
}
#
#sub siblings {
#	my @siblings;
#	push(@siblings, $wn->querySense($_, "hypo")) for $_[0];
#	return @siblings;
#}
#print "Hyponyms: ", join(", ", $wn->querySense("cat#n#1", "hypo")), "\n";
#print "Parts of Speech: ", join(", ", $wn->querySense("run")), "\n";
#print "Senses: ", join(", ", $wn->querySense("run#v")), "\n";
#print "Forms: ", join(", ", $wn->validForms("lay down#v")), "\n";
#print "Noun count: ", scalar($wn->listAllWords("noun")), "\n";
#print "Antonyms: ", join(", ", $wn->queryWord("dark#n#1", "ants")), "\n";