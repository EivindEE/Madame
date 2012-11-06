#!/usr/bin/perl

use WordNet::QueryData;
use JSON;
my $wn = WordNet::QueryData->new(
	dir => "/usr/local/Wordnet-3.0/dict",
	noload => 1);
my $json = JSON->new->allow_nonref;
# Takes an argument in the form synset-wordsens-gramaticalcategory-senscount
my @stripped = ($ARGV[0] =~ /.*-(.*)-(.).*-(.*)/);
my $synset = join('#', @stripped);

my @parent = parent($synset);

print encode_json {"parents" => [@parent]};


sub parent {
	return $wn->querySense($_[0], "hype");
}
