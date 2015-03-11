package local.entwickler.photos;

import java.io.Serializable;

import lotus.domino.Document;
import lotus.domino.NotesException;

public class Image implements Serializable, Comparable<Image> {

	private static final long serialVersionUID = 1L;

	private String _subject;
	private String _description;
	private String _universalID;

	/**
	 * Zero-Argument Constructor
	 */
	public Image() {
	}

	public Image(Document document) {
		this.load(document);
	}

	public void load(Document document) {

		try {
			this._subject = document.getItemValueString("subject");
			this._description = document.getItemValueString("description");
			this._universalID = document.getUniversalID();
		} catch (NotesException e) {
			System.out.println("**********");
			System.out.println("EXCEPTION in Image.load(document) method");
			e.printStackTrace();
		}

		System.out.println("Image.load(document)");
		System.out.println("\t Subject: " + this.getSubject());
		System.out.println("\t Description: " + this.getSubject());
		System.out.println("\t UniversalID: " + this.getUniversalID());

	}

	public String getSubject() {
		return this._subject;
	}

	public String getDescription() {
		return this._description;
	}

	public String getUniversalID() {
		return this._universalID;
	}

	public String getUrl() {
		String delimiter = "//";
		StringBuilder sb = new StringBuilder();
		sb.append("..");
		sb.append(delimiter);
		sb.append("attachments.nsf");
		sb.append(delimiter);
		sb.append("0");
		sb.append(delimiter);
		sb.append(this.getUniversalID());
		sb.append(delimiter);
		sb.append("$FILE");
		sb.append(delimiter);
		sb.append("image.jpg");

		return sb.toString();
	}

	/*
	 * ***************************************************
	 * ***************************************************
	 * 
	 * Comparable implementation methods
	 * 
	 * ***************************************************
	 * ***************************************************
	 */

	/*
	 * (non-Javadoc)
	 * 
	 * @see java.lang.Comparable#compareTo(java.lang.Object)
	 */
	public int compareTo(final Image imageToCompare) {
		return Image.compare(this, imageToCompare);
	}

	/**
	 * Default Comparable implementation. (Natural Comparison Method)
	 * 
	 * Image objects are compared as follows:
	 * <ol>
	 * <li>Existence of both objects</li>
	 * <li>Equality using .equals() method</li>
	 * <li>Subject</li>
	 * <li>HashCode</li>
	 * </ol>
	 * 
	 * @param handle0
	 *            First Image object for comparison.
	 * 
	 * @param handle1
	 *            Second Image object for comparison.
	 * 
	 * @return a negative integer, zero, or a positive integer as this object is
	 *         less than, equal to, or greater than the specified object.
	 * 
	 * 
	 * @see java.lang.Comparable#compareTo(Object)
	 * @see org.openntf.domino.utils.DominoUtils#LESS_THAN
	 * @see org.openntf.domino.utils.DominoUtils#EQUAL
	 * @see org.openntf.domino.utils.DominoUtils#GREATER_THAN
	 */
	public static int compare(final Image handle0, final Image handle1) {

		if (null == handle0) {
			return (null == handle1) ? Utilities.EQUAL : Utilities.LESS_THAN;
		} else if (null == handle1) {
			return Utilities.GREATER_THAN;
		}

		if (handle0.equals(handle1)) {
			return Utilities.EQUAL;
		}

		int result = handle0.getSubject().compareTo(handle1.getSubject());
		if (result == Utilities.EQUAL) {
			final int int0 = handle0.hashCode();
			final int int1 = handle1.hashCode();
			if (int0 != int1) {
				result = (int0 < int1) ? Utilities.LESS_THAN
						: Utilities.GREATER_THAN;
			}
		}

		return result;
	}

	/*
	 * ***************************************************
	 * ***************************************************
	 * 
	 * hashCode and equals
	 * 
	 * ***************************************************
	 * ***************************************************
	 */
	@Override
	public int hashCode() {
		final int prime = 31;
		int result = 1;
		result = prime * result
				+ ((_description == null) ? 0 : _description.hashCode());
		result = prime * result
				+ ((_subject == null) ? 0 : _subject.hashCode());
		result = prime * result
				+ ((_universalID == null) ? 0 : _universalID.hashCode());
		return result;
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Image other = (Image) obj;
		if (_description == null) {
			if (other._description != null)
				return false;
		} else if (!_description.equals(other._description))
			return false;
		if (_subject == null) {
			if (other._subject != null)
				return false;
		} else if (!_subject.equals(other._subject))
			return false;
		if (_universalID == null) {
			if (other._universalID != null)
				return false;
		} else if (!_universalID.equals(other._universalID))
			return false;
		return true;
	}

}
