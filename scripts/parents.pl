#!/usr/bin/perl

use WordNet::QueryData;
use JSON;
my $wn = WordNet::QueryData->new(
	dir => "/usr/local/WordNet-3.0/dict/",
	noload => 1);
# Takes an argument in the form synset-wordsens-gramaticalcategory-senscount
my @stripped = ($ARGV[0] =~ /.*-(.*)-(.).*-(.*)/);
my $synset = join('#', @stripped);

my @hypernym = hypernym($synset);
my @hypernyms;
while ( @hypernym){ # Does a breadth first search through the WordNet graph, can be switched to depth first by substituting shift with pop
	my $hypernym = shift @hypernym;
	push(@hypernym, hypernym($hypernym));
	push(@hypernyms, $hypernym);
}

my @hypernyms_with_siblings;
push(@hypernyms_with_siblings, {"synset" => $_ , "offset" => $wn->offset($_) ,"siblings" => [siblings($_)]}) for @hypernyms;

my %result_map = ("chain" => [uniq(@hypernyms_with_siblings)], "synset" => $synset, "offset"=> $wn->offset($synset), "siblings" => [siblings($synset)]);
my $json = JSON->new->utf8->pretty->encode(\%result_map);
print $json;

sub hypernym {
	my @hypernym = $wn->querySense($_[0], "hype");
	if ($#hypernym > 0) {
		return ();
	}
	return @hypernym;
}


sub siblings {
	my $synset = $_[0];
	my @hypernym = hypernym($synset); # Find hypernym of synset
	my @siblings;
	my @sibling_and_offset;
	push(@siblings, $wn->querySense($_, "hypo")) for @hypernym;
	my $index = 0;
	for my $value (@siblings) { # Removes term from siblings
		if ($value eq $synset) {
			splice @siblings, $index, 1;
		}
		$index += 1;
	}
	for my $sibling (@siblings) {
		push (@sibling_and_offset, {"synset" => $sibling, "offset" => $wn->offset($sibling)});
	}
	return @sibling_and_offset;
}

sub uniq { # Copied from http://stackoverflow.com/questions/7651/how-do-i-remove-duplicate-items-from-an-array-in-perl#answer-7657
    my %seen = ();
    my @r = ();
    foreach my $a (@_) {
        unless ($seen{$a}) {
            push @r, $a;
            $seen{$a} = 1;
        }
    }
    return @r;
}
