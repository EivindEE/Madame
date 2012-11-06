#!/usr/bin/perl

use WordNet::QueryData;
use JSON;
my $wn = WordNet::QueryData->new(
	dir => "/usr/local/Wordnet-3.0/dict",
	noload => 1);
my $json = JSON->new->allow_nonref;


print encode_json parent_and_siblings($ARGV[0]);


sub parent_and_siblings {
	my @parent = parent($_[0]);
	my @siblings = siblings(@parent);

	return {"parent" => [@parent],"siblings" => [@siblings]};
}

sub parent {
	return $wn->querySense($_[0], "hype");
}

sub siblings {
	my @siblings;
	push(@siblings, $wn->querySense($_, "hypo")) for $_[0];
	return @siblings;
}