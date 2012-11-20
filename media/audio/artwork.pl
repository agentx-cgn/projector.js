#!/usr/bin/perl -w
use strict;
$|++;

#--------------------------------------------------------
# Artwork: artwork.pl v.2b 2007-05-17 16:00:09
# Pull album art from id3v2 tags
# Copyright (c) 2007 William Galway All Rights Reserved.
# http://www.galwayland.com
# wgalway@hotmail.com
#
# This program is free software; you can redistribute it and/or
# modify it under the terms of the GNU General Public License
# as published by the Free Software Foundation; either version 2
# of the License, or (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
#
# Artwork.pl is a script to retrieve album art images from
# the APIC frame of ID3v2 MP3 tags. Specify the location of
# your music library and the script will search it for mp3s
# and extract the album art to the MP3 sub folders with
# the name of your choosing. The JPEGS are resized to 150x150.
# Read logfile.txt for a list of mp3 folders w/o album art.
#
# It requires the MP3::Tag, File::Find, and Image::Magick
# Perl modules. It is an effective tool to create album art
# JPEG files for music jukebox applications such
# as Andromeda and Jinzora.
#
# Note: For Andromeda choose _folderOpenImage.jpg as the album art
# file name.
#--------------------------------------------------------
my $VERSION = '.2b';

#
use MP3::Tag;
use File::Find;
use Image::Magick;

my %paths;

# MP3 Directory
print "Type the path to your mp3s and press Enter. \n";
my $mp3dir = <STDIN>;
chomp $mp3dir;
print "\n";

# Album Art File Name
print "Type the name of the album art file you\n";
print "would like extracted to your mp3 folder and press Enter.\n";
print "For example cover.jpg\n";
my $cover = <STDIN>;
chomp $cover;
print "\n";

if ( -e $mp3dir ) {
    print "Checking $mp3dir for mp3s.\n";
}
else {
    print("MP3 directory does not exist\n");
    exit;
}

find( \&ExtractTagInfo, $mp3dir );

sub ExtractTagInfo {

    if (/\.mp3$/) {

        my $art;

        my $mp3 = MP3::Tag->new($_);

        $mp3->get_tags();
        if ( exists $mp3->{ID3v2} ) {
            my $id3v2_tagdata = $mp3->{ID3v2};
            my $info          = $id3v2_tagdata->get_frame("APIC");
            $mp3->close();
            while ( my ( $key, $value ) = each(%$info) ) {
                if ( $key eq "_Data" ) {
                    $art = $value;
                }
            }
        }
        if ( -e "$File::Find::dir/$cover" || -e $cover ) {

            #print "$File::Find::dir/$cover already exists \n";
        }

        # write the art to file
        elsif ($art) {
            open( ARTWORK, ">$cover" )
              or die
"Could not open \n$File::Find::dir/$cover\n Check your permissions.\n";
            binmode(ARTWORK);
            print ARTWORK $art;
            close(ARTWORK);
            print "Extracting Art From - $File::Find::name\n";

            #Resize Artwork
            my ( $image, $x );
            $image = Image::Magick->new;
            $x     = $image->Read("$cover");
            warn "$x" if "$x";
            $x = $image->Scale('175x175');
            $x = $image->Write("$cover");
        }
        else {
            $paths{"$File::Find::dir"}++;
        }
    }
}
print "\n";
print
"All Done! Open logfile.txt for a list of mp3 directories w/o album art information.\n";

open LOGFILE, ">logfile.txt"
  or die "Could not open newlog.txt for writing\n";

print LOGFILE "The follwing directories are w/o ablum art.\n";
print LOGFILE "$_\n" foreach ( keys %paths );

close LOGFILE;

exit
